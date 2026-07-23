import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import api from '../../services/api';
import { extractYoutubeId, getYoutubeEmbedUrl } from '../../utils/helpers';
import Loader from '../../components/ui/Loader';
import { FiEdit2, FiTrash2, FiVideo, FiBookOpen, FiPlus, FiCheck, FiX } from 'react-icons/fi';
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

const toDatetimeLocal = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const AdminLectures = () => {
  const { data, loading, error: fetchError, refetch } = useFetch('/lectures', {
    limit: 200,
    all: 1,
  });
  const { categoryNames } = useSiteSettings();
  const [form, setForm] = useState(emptyLecture);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const lecturesList = data?.data || [];
  const categories = categoryNames.length
    ? categoryNames
    : ['العقيدة', 'الفقه', 'أصول فقه', 'التفسير', 'الحديث', 'السيرة', 'آداب طالب العلم', 'الرقائق', 'علوم قرآن', 'عام'];
  const previewId = extractYoutubeId(form.youtubeUrl);

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
      category: form.category,
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
    }

    try {
      if (editId) {
        await api.put(`/lectures/${editId}`, payload);
        setSuccess('تم تحديث الدرس — يظهر الآن في صفحات العرض ✓');
      } else {
        await api.post('/lectures', payload);
        setSuccess('تم إضافة الدرس — يظهر الآن في صفحات العرض ✓');
      }
      setForm(emptyLecture);
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
      category: lecture.category || categories[0] || 'العقيدة',
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
          <h2>إدارة الدروس والكتب والدورات</h2>
          <p>أي إضافة أو تعديل يُحفظ على السيرفر ويظهر مباشرة للزوار</p>
        </div>
      </div>

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
            <label>تاريخ النشر (اختياري — جدولة)</label>
            <input
              type="datetime-local"
              value={form.publishedAt}
              onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
            />
          </div>

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

        <div className="form-group" style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>اختبار MCQ (اختيار من متعدد)</label>
            <button type="button" className="btn-admin-submit" style={{ padding: '6px 12px' }} onClick={addQuizItem}>
              <FiPlus /> إضافة سؤال
            </button>
          </div>

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
                setForm(emptyLecture);
              }}
            >
              إلغاء التعديل
            </button>
          )}
        </div>
      </form>

      <div className="admin-list-section">
        <div className="list-section-header">
          <h3>قائمة الدروس المتاحة ({lecturesList.length})</h3>
        </div>

        {loading && !lecturesList.length ? (
          <Loader />
        ) : (
          <div className="admin-cards-grid">
            {lecturesList.map((item) => (
              <div key={item._id} className="admin-lecture-card">
                <div className="card-badge-row">
                  <span className="card-cat-badge">{item.category}</span>
                  {item.order != null && (
                    <span className="card-pdf-badge">#{item.order}</span>
                  )}
                  {item.pdfUrl && <span className="card-pdf-badge"><FiBookOpen /> PDF مرفق</span>}
                </div>

                <h4 className="card-lecture-title">{item.title}</h4>
                <p className="card-series-name">
                  <FiVideo /> {item.series || 'بدون سلسلة'}
                </p>

                <div className="card-actions-footer">
                  <button type="button" className="btn-card-edit" onClick={() => handleEdit(item)}>
                    <FiEdit2 /> تعديل
                  </button>
                  <button type="button" className="btn-card-delete" onClick={() => handleDelete(item._id)}>
                    <FiTrash2 /> حذف
                  </button>
                </div>
              </div>
            ))}

            {!lecturesList.length && (
              <p className="empty-list-msg">لا توجد دروس مضافة حتى الآن.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLectures;
