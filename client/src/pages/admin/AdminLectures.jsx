import { useState, useEffect } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import api from '../../services/api';
import { extractYoutubeId, getYoutubeEmbedUrl } from '../../utils/helpers';
import Loader from '../../components/ui/Loader';
import {
  FiEdit2,
  FiTrash2,
  FiVideo,
  FiBookOpen,
  FiPlus,
  FiCheck,
  FiX,
  FiHelpCircle,
  FiMove,
  FiChevronDown,
  FiDownload,
} from 'react-icons/fi';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './Admin.css';

const emptyQuizItem = () => ({
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
});

const emptyLecture = {
  title: '',
  category: 'العقيدة',
  series: '',
  order: 0,
  publishedAt: '',
  youtubeUrl: '',
  pdfUrl: '',
  audioUrl: '',
  description: '',
  quizQuestionsText: '',
  quizItems: [],
};

const emptyImportForm = { playlistUrl: '', category: '', series: '' };

const toDatetimeLocal = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Groups lectures by series, sorted the same way the public site orders them
// (seriesOrder for the series block, order for lessons inside it), so drag
// handles here match what a visitor actually sees.
const buildSeriesGroups = (list) => {
  const bySeries = new Map();
  list.forEach((lecture) => {
    const key = lecture.series || 'بدون سلسلة';
    if (!bySeries.has(key)) {
      bySeries.set(key, { series: key, seriesOrder: lecture.seriesOrder || 0, lectures: [] });
    }
    const group = bySeries.get(key);
    group.seriesOrder = Math.max(group.seriesOrder, lecture.seriesOrder || 0);
    group.lectures.push(lecture);
  });
  const groups = [...bySeries.values()];
  groups.forEach((g) => {
    g.lectures.sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });
  });
  groups.sort((a, b) => {
    if (a.seriesOrder !== b.seriesOrder) return a.seriesOrder - b.seriesOrder;
    return a.series.localeCompare(b.series, 'ar');
  });
  return groups;
};

// seriesOrder is scoped per category, and the "كل الدروس" admin tab lists every
// category together — so series must be grouped (and reordered) one category
// at a time, never mixed across categories in a single sortable list.
const buildCategoryBlocks = (list, fixedCategory) => {
  if (fixedCategory) {
    return [{ category: fixedCategory, groups: buildSeriesGroups(list) }];
  }
  const byCategory = new Map();
  list.forEach((lecture) => {
    const key = lecture.category || 'عام';
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key).push(lecture);
  });
  return [...byCategory.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'ar'))
    .map(([category, lectures]) => ({ category, groups: buildSeriesGroups(lectures) }));
};

const LessonRow = ({ lecture, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lecture._id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="admin-lecture-card lesson-sortable-row">
      <div className="card-badge-row">
        <span className="card-cat-badge">{lecture.category}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {lecture.order != null && <span className="card-pdf-badge">#{lecture.order}</span>}
          <button type="button" className="drag-handle" {...attributes} {...listeners} aria-label="اسحب لإعادة الترتيب">
            <FiMove />
          </button>
        </div>
      </div>
      <h4 className="card-lecture-title">{lecture.title}</h4>
      <div className="card-actions-footer">
        <button type="button" className="btn-card-edit" onClick={() => onEdit(lecture)}>
          <FiEdit2 /> تعديل
        </button>
        <button type="button" className="btn-card-delete" onClick={() => onDelete(lecture._id)}>
          <FiTrash2 /> حذف
        </button>
      </div>
    </div>
  );
};

const SeriesGroup = ({ group, expanded, onToggle, onReorderLessons, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: group.series,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleLessonDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = group.lectures.findIndex((l) => l._id === active.id);
    const newIndex = group.lectures.findIndex((l) => l._id === over.id);
    const reordered = arrayMove(group.lectures, oldIndex, newIndex);
    onReorderLessons(group.series, reordered);
  };

  return (
    <div ref={setNodeRef} style={style} className="series-group">
      <div className="series-group-header">
        <button type="button" className="drag-handle" {...attributes} {...listeners} aria-label="اسحب لإعادة ترتيب السلسلة">
          <FiMove />
        </button>
        <button type="button" className="series-toggle" onClick={() => onToggle(group.series)}>
          <FiChevronDown className={expanded ? 'chevron-open' : ''} />
          <FiVideo /> {group.series}
          <span className="card-cat-badge">{group.lectures.length} درس</span>
        </button>
      </div>

      {expanded && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd}>
          <SortableContext items={group.lectures.map((l) => l._id)} strategy={verticalListSortingStrategy}>
            <div className="series-group-body admin-cards-grid">
              {group.lectures.map((lecture) => (
                <LessonRow key={lecture._id} lecture={lecture} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

const AdminLectures = ({ fixedCategory }) => {
  const { data, loading, error: fetchError, refetch } = useFetch('/lectures', {
    limit: 1000,
    all: 1,
    ...(fixedCategory && { category: fixedCategory }),
  });
  const { categoryNames } = useSiteSettings();
  const [form, setForm] = useState(() => ({
    ...emptyLecture,
    category: fixedCategory || emptyLecture.category,
  }));
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [importForm, setImportForm] = useState(() => ({
    ...emptyImportForm,
    category: fixedCategory || '',
  }));
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  const categories = categoryNames.length
    ? categoryNames
    : ['العقيدة', 'الفقه', 'أصول فقه', 'التفسير', 'الحديث', 'السيرة', 'آداب طالب العلم', 'الرقائق', 'علوم قرآن', 'عام'];

  const [categoryBlocks, setCategoryBlocks] = useState([]);
  useEffect(() => {
    setCategoryBlocks(buildCategoryBlocks(data?.data || [], fixedCategory));
  }, [data, fixedCategory]);

  const [expandedSeries, setExpandedSeries] = useState(() => new Set());
  const toggleSeries = (series) => {
    setExpandedSeries((prev) => {
      const next = new Set(prev);
      if (next.has(series)) next.delete(series);
      else next.add(series);
      return next;
    });
  };

  const previewId = extractYoutubeId(form.youtubeUrl);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const resetCategoryBlocks = () => setCategoryBlocks(buildCategoryBlocks(data?.data || [], fixedCategory));

  const handleSeriesDragEnd = (category) => async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const block = categoryBlocks.find((b) => b.category === category);
    const oldIndex = block.groups.findIndex((g) => g.series === active.id);
    const newIndex = block.groups.findIndex((g) => g.series === over.id);
    const reorderedGroups = arrayMove(block.groups, oldIndex, newIndex);
    setCategoryBlocks((prev) =>
      prev.map((b) => (b.category === category ? { ...b, groups: reorderedGroups } : b))
    );

    try {
      await api.put('/lectures/reorder-series', {
        category,
        seriesNames: reorderedGroups.map((g) => g.series),
      });
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل حفظ ترتيب السلاسل');
      resetCategoryBlocks();
    }
  };

  const handleReorderLessons = (category) => async (seriesName, reorderedLessons) => {
    setCategoryBlocks((prev) =>
      prev.map((b) =>
        b.category !== category
          ? b
          : {
              ...b,
              groups: b.groups.map((g) =>
                g.series === seriesName ? { ...g, lectures: reorderedLessons } : g
              ),
            }
      )
    );
    try {
      await api.put('/lectures/reorder-lessons', { ids: reorderedLessons.map((l) => l._id) });
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل حفظ ترتيب الدروس');
      resetCategoryBlocks();
    }
  };

  const updateQuizItem = (idx, field, value) => {
    setForm((prev) => {
      const items = [...(prev.quizItems || [])];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, quizItems: items };
    });
  };

  const updateQuizOption = (qIdx, oIdx, value) => {
    setForm((prev) => {
      const items = [...(prev.quizItems || [])];
      const options = [...(items[qIdx]?.options || ['', '', '', ''])];
      options[oIdx] = value;
      items[qIdx] = { ...items[qIdx], options };
      return { ...prev, quizItems: items };
    });
  };

  const addQuizItem = () => {
    setForm((prev) => ({
      ...prev,
      quizItems: [...(prev.quizItems || []), emptyQuizItem()],
    }));
  };

  const removeQuizItem = (idx) => {
    setForm((prev) => ({
      ...prev,
      quizItems: (prev.quizItems || []).filter((_, i) => i !== idx),
    }));
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    setImportError('');
    setImportSuccess('');
    setImporting(true);
    try {
      const res = await api.post('/lectures/import-playlist', {
        playlistUrl: importForm.playlistUrl,
        category: fixedCategory || importForm.category,
        series: importForm.series,
      });
      const d = res.data?.data;
      setImportSuccess(
        `تم الاستيراد: ${d.videosFound} فيديو — أضيف ${d.created} / حُدّث ${d.updated} / تخطّي ${d.skipped}. السلسلة "${d.seriesName}" أُضيفت بترتيب ${d.seriesOrder} داخل فئة ${d.category}.`
      );
      setImportForm({ ...emptyImportForm, category: fixedCategory || '' });
      refetch();
    } catch (err) {
      setImportError(err.response?.data?.message || 'فشل استيراد قائمة التشغيل');
    } finally {
      setImporting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const quizQuestions = form.quizQuestionsText
      ? form.quizQuestionsText.split('\n').map((q) => q.trim()).filter(Boolean)
      : [];

    const quizItems = (form.quizItems || [])
      .filter((item) => item.question?.trim())
      .map((item) => ({
        question: item.question.trim(),
        options: (item.options || []).map((o) => o.trim()).filter(Boolean),
        correctIndex: Number(item.correctIndex) || 0,
      }))
      .filter((item) => item.options.length >= 2);

    const youtubeId = previewId;
    if (!youtubeId) {
      setError('رابط اليوتيوب غير صالح');
      setSubmitting(false);
      return;
    }

    const payload = {
      title: form.title,
      category: fixedCategory || form.category,
      series: form.series || form.title.split('—')[0].trim(),
      order: Number(form.order) || 0,
      youtubeUrl: form.youtubeUrl,
      youtubeId,
      pdfUrl: form.pdfUrl || '',
      audioUrl: form.audioUrl || '',
      description: form.description || '',
      quizQuestions,
      quizItems,
    };

    if (form.publishedAt) {
      payload.publishedAt = new Date(form.publishedAt).toISOString();
    } else {
      payload.publishedAt = new Date().toISOString();
    }

    try {
      if (editId) {
        await api.put(`/lectures/${editId}`, payload);
        setSuccess('تم تحديث الدرس — يظهر الآن في صفحات العرض ✓');
      } else {
        await api.post('/lectures', payload);
        setSuccess('تم إضافة الدرس — يظهر الآن في صفحات العرض ✓');
      }
      setForm({ ...emptyLecture, category: fixedCategory || emptyLecture.category });
      setEditId(null);
      refetch();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.response?.status === 401
            ? 'انتهت الجلسة — سجّل دخول الأدمن بحساب حقيقي من السيرفر'
            : 'فشل الحفظ على السيرفر — لم يتم نشر التعديل للزوار')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (lecture) => {
    setEditId(lecture._id);
    setForm({
      title: lecture.title || '',
      category: fixedCategory || lecture.category || categories[0] || 'العقيدة',
      series: lecture.series || '',
      order: lecture.order ?? 0,
      publishedAt: toDatetimeLocal(lecture.publishedAt),
      youtubeUrl: lecture.youtubeUrl || '',
      pdfUrl: lecture.pdfUrl || '',
      audioUrl: lecture.audioUrl || '',
      description: lecture.description || '',
      quizQuestionsText: Array.isArray(lecture.quizQuestions)
        ? lecture.quizQuestions.join('\n')
        : '',
      quizItems: Array.isArray(lecture.quizItems)
        ? lecture.quizItems.map((item) => ({
            question: item.question || '',
            options: [
              item.options?.[0] || '',
              item.options?.[1] || '',
              item.options?.[2] || '',
              item.options?.[3] || '',
            ],
            correctIndex: item.correctIndex ?? 0,
          }))
        : [],
    });
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الدرس؟')) return;
    setError('');
    try {
      await api.delete(`/lectures/${id}`);
      setSuccess('تم حذف الدرس من الموقع ✓');
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل الحذف على السيرفر');
    }
  };

  return (
    <div className="admin-lectures-page">
      <div className="admin-page-header">
        <div>
          <h2>{fixedCategory ? `إدارة دروس ${fixedCategory}` : 'إدارة الدروس والكتب والدورات'}</h2>
          <p>أي إضافة أو تعديل يُحفظ على السيرفر ويظهر مباشرة للزوار</p>
        </div>
      </div>

      <form onSubmit={handleImportSubmit} className="admin-form-card">
        <h3 className="form-card-title">
          <FiDownload /> استيراد سلسلة كاملة من قائمة تشغيل يوتيوب
        </h3>
        <p className="settings-hint">
          الصق رابط قائمة التشغيل، اختر الفئة واكتب اسم السلسلة — يُستورد كل الفيديوهات تلقائيًا
          وتُضاف السلسلة في آخر ترتيب فئتها مباشرة.
        </p>

        {importError && <div className="alert alert-error">{importError}</div>}
        {importSuccess && <div className="alert alert-success">{importSuccess}</div>}

        <div className="form-grid">
          <div className="form-group">
            <label>رابط قائمة التشغيل *</label>
            <input
              value={importForm.playlistUrl}
              onChange={(e) => setImportForm({ ...importForm, playlistUrl: e.target.value })}
              required
              placeholder="https://www.youtube.com/playlist?list=..."
            />
          </div>

          {!fixedCategory && (
            <div className="form-group">
              <label>الفئة *</label>
              <select
                value={importForm.category}
                onChange={(e) => setImportForm({ ...importForm, category: e.target.value })}
                required
              >
                <option value="" disabled>اختر الفئة</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>اسم السلسلة *</label>
            <input
              value={importForm.series}
              onChange={(e) => setImportForm({ ...importForm, series: e.target.value })}
              required
              placeholder="مثال: شرح كتاب التوحيد"
            />
          </div>
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="btn-admin-submit" disabled={importing}>
            <FiDownload /> {importing ? 'جارٍ الاستيراد…' : 'استيراد القائمة'}
          </button>
        </div>
      </form>

      <form onSubmit={handleSubmit} className="admin-form-card">
        <h3 className="form-card-title">
          {editId ? <><FiEdit2 /> تعديل الدرس الحالي</> : <><FiPlus /> إضافة درس جديد</>}
        </h3>

        {(error || fetchError) && (
          <div className="alert alert-error">{error || fetchError}</div>
        )}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="form-grid">
          <div className="form-group">
            <label>عنوان الدرس / المجلس *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="مثال: التعليق على كتاب القواعد المثلى — المجلس 1"
            />
          </div>

          <div className="form-group">
            <label>اسم الكتاب أو السلسلة (لتجميع الدروس)</label>
            <input
              value={form.series}
              onChange={(e) => setForm({ ...form, series: e.target.value })}
              placeholder="مثال: التعليق على كتاب القواعد المثلى"
            />
          </div>

          <div className="form-group">
            <label>ترتيب الدرس في السلسلة</label>
            <input
              type="number"
              min={0}
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>تاريخ النشر (اتركه فارغاً للنشر الفوري)</label>
            <input
              type="datetime-local"
              value={form.publishedAt}
              onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
            />
            <small style={{ color: 'var(--text-muted)' }}>
              إذا وضعت تاريخاً مستقبلياً لن تظهر السلسلة للزوار حتى يحين الموعد
            </small>
          </div>

          {!fixedCategory && (
            <div className="form-group">
              <label>العلم الشرعي / التصنيف</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>رابط فيديو اليوتيوب *</label>
            <input
              value={form.youtubeUrl}
              onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
              required
              placeholder="https://youtu.be/..."
            />
          </div>

          <div className="form-group">
            <label>رابط الكتاب PDF (مثلاً Archive.org)</label>
            <input
              value={form.pdfUrl}
              onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
              placeholder="https://archive.org/embed/..."
            />
          </div>

          <div className="form-group">
            <label>رابط التسجيل الصوتي (MP3)</label>
            <input
              value={form.audioUrl}
              onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
              placeholder="https://.../audio.mp3"
            />
          </div>
        </div>

        {previewId && (
          <div className="form-preview-box">
            <label>معاينة مشغل اليوتيوب:</label>
            <div className="youtube-preview-frame">
              <iframe src={getYoutubeEmbedUrl(previewId)} title="معاينة" allowFullScreen />
            </div>
          </div>
        )}

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>أسئلة اختبر نفسك (نص — سؤال في كل سطر)</label>
          <textarea
            rows={3}
            value={form.quizQuestionsText}
            onChange={(e) => setForm({ ...form, quizQuestionsText: e.target.value })}
            placeholder="السؤال الأول...&#10;السؤال الثاني..."
          />
        </div>

        <div className="admin-form-card quiz-builder-card" style={{ marginTop: '24px', marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h3 className="form-card-title" style={{ marginBottom: 0 }}>
              <FiHelpCircle /> اختبار MCQ (اختيار من متعدد)
            </h3>
            <button type="button" className="btn-admin-submit" style={{ padding: '6px 12px' }} onClick={addQuizItem}>
              <FiPlus /> إضافة سؤال
            </button>
          </div>
          <p className="settings-hint" style={{ marginTop: '6px' }}>
            اختياري — لو أضفت أسئلة هنا، الطالب لازم يحلها ويحصل على 60% على الأقل عشان يقدر يكمّل الدرس ويحصل على الشهادة.
            التصحيح يتم تلقائياً على السيرفر، وتحديد الإجابة الصحيحة يكون بالضغط على الدائرة بجانب الخيار الصح.
          </p>

          {(form.quizItems || []).map((item, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid var(--primary-border)',
                borderRadius: 10,
                padding: '1rem',
                marginTop: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong>سؤال {idx + 1}</strong>
                <button type="button" onClick={() => removeQuizItem(idx)} aria-label="حذف">
                  <FiX />
                </button>
              </div>
              <input
                value={item.question}
                onChange={(e) => updateQuizItem(idx, 'question', e.target.value)}
                placeholder="نص السؤال"
                style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
              />
              {(item.options || []).map((opt, oIdx) => (
                <div key={oIdx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <input
                    type="radio"
                    name={`correct-${idx}`}
                    checked={Number(item.correctIndex) === oIdx}
                    onChange={() => updateQuizItem(idx, 'correctIndex', oIdx)}
                  />
                  <input
                    value={opt}
                    onChange={(e) => updateQuizOption(idx, oIdx, e.target.value)}
                    placeholder={`الخيار ${oIdx + 1}`}
                    style={{ flex: 1, padding: '0.4rem' }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="btn-admin-submit" disabled={submitting}>
            <FiCheck /> {editId ? 'حفظ ونشر التعديلات' : 'إضافة ونشر الدرس'}
          </button>
          {editId && (
            <button
              type="button"
              className="btn-admin-cancel"
              onClick={() => {
                setEditId(null);
                setForm({ ...emptyLecture, category: fixedCategory || emptyLecture.category });
              }}
            >
              إلغاء التعديل
            </button>
          )}
        </div>
      </form>

      <div className="admin-list-section">
        <div className="list-section-header">
          <h3>السلاسل والدروس ({data?.data?.length || 0}) — اسحب لإعادة الترتيب</h3>
        </div>

        {loading && !categoryBlocks.length ? (
          <Loader />
        ) : (
          <>
            {categoryBlocks.map((block) => (
              <div key={block.category} className="category-block">
                {!fixedCategory && <h4 className="category-block-title">{block.category}</h4>}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleSeriesDragEnd(block.category)}
                >
                  <SortableContext items={block.groups.map((g) => g.series)} strategy={verticalListSortingStrategy}>
                    <div className="series-groups-list">
                      {block.groups.map((group) => (
                        <SeriesGroup
                          key={group.series}
                          group={group}
                          expanded={expandedSeries.has(group.series)}
                          onToggle={toggleSeries}
                          onReorderLessons={handleReorderLessons(block.category)}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            ))}
            {!categoryBlocks.length && <p className="empty-list-msg">لا توجد دروس مضافة حتى الآن.</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLectures;
