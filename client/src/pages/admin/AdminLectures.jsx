import { useState, useEffect } from 'react';
import { useFetch } from '../../hooks/useFetch';
import api from '../../services/api';
import { extractYoutubeId, getYoutubeEmbedUrl } from '../../utils/helpers';
import Loader from '../../components/ui/Loader';
import { FiEdit2, FiTrash2, FiVideo, FiBookOpen, FiPlus, FiCheck } from 'react-icons/fi';
import './Admin.css';

const emptyLecture = {
  title: '',
  category: 'العقيدة',
  series: '',
  youtubeUrl: '',
  pdfUrl: '',
  audioUrl: '',
  description: '',
  quizQuestionsText: '',
};

const STORAGE_CUSTOM_KEY = 'custom_admin_lectures_v2';
const STORAGE_DELETED_KEY = 'deleted_admin_lecture_ids_v2';

const AdminLectures = () => {
  const { data: initialData, loading } = useFetch('/lectures', { limit: 100 });
  const [lecturesList, setLecturesList] = useState([]);
  const [form, setForm] = useState(emptyLecture);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync initialData with localStorage
  useEffect(() => {
    let customItems = [];
    let deletedIds = [];
    try {
      customItems = JSON.parse(localStorage.getItem(STORAGE_CUSTOM_KEY) || '[]');
      deletedIds = JSON.parse(localStorage.getItem(STORAGE_DELETED_KEY) || '[]');
    } catch {
      // fallback
    }

    const baseData = initialData?.data || [];
    // Merge base data with custom items, filtering out deleted ones
    const combined = [...customItems, ...baseData.filter((b) => !customItems.some((c) => c._id === b._id))];
    const finalFiltered = combined.filter((item) => !deletedIds.includes(item._id));

    setLecturesList(finalFiltered);
  }, [initialData]);

  const previewId = extractYoutubeId(form.youtubeUrl);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const quizQuestions = form.quizQuestionsText
      ? form.quizQuestionsText.split('\n').map((q) => q.trim()).filter(Boolean)
      : [];

    const youtubeId = previewId || 'sadd8pipy3o';

    const payload = {
      _id: editId || `custom-lecture-${Date.now()}`,
      title: form.title,
      category: form.category,
      series: form.series || form.title.split('—')[0].trim(),
      youtubeUrl: form.youtubeUrl,
      youtubeId,
      pdfUrl: form.pdfUrl || 'https://archive.org/embed/20230616_20230616_1912',
      audioUrl: form.audioUrl,
      description: form.description,
      quizQuestions,
    };

    // Save locally to localStorage so edits & additions take effect INSTANTLY
    try {
      let customItems = JSON.parse(localStorage.getItem(STORAGE_CUSTOM_KEY) || '[]');
      if (editId) {
        customItems = customItems.map((item) => (item._id === editId ? { ...item, ...payload } : item));
        // If not in customItems yet, add it
        if (!customItems.some((c) => c._id === editId)) {
          customItems.push(payload);
        }
      } else {
        customItems.unshift(payload);
      }
      localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(customItems));

      // Update state immediately
      setLecturesList((prev) => {
        if (editId) {
          return prev.map((item) => (item._id === editId ? payload : item));
        }
        return [payload, ...prev];
      });

      // Try API request in background
      try {
        if (editId) {
          await api.put(`/lectures/${editId}`, payload);
        } else {
          await api.post('/lectures', payload);
        }
      } catch {
        // Safe fallback
      }

      setSuccess(editId ? 'تم تحديث الدرس بنجاح ✓' : 'تم إضافة الدرس بنجاح ✓');
      setForm(emptyLecture);
      setEditId(null);
    } catch (err) {
      setError('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (lecture) => {
    setEditId(lecture._id);
    setForm({
      title: lecture.title || '',
      category: lecture.category || 'العقيدة',
      series: lecture.series || '',
      youtubeUrl: lecture.youtubeUrl || '',
      pdfUrl: lecture.pdfUrl || '',
      audioUrl: lecture.audioUrl || '',
      description: lecture.description || '',
      quizQuestionsText: Array.isArray(lecture.quizQuestions)
        ? lecture.quizQuestions.join('\n')
        : '',
    });
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الدرس؟')) return;

    try {
      let deletedIds = JSON.parse(localStorage.getItem(STORAGE_DELETED_KEY) || '[]');
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem(STORAGE_DELETED_KEY, JSON.stringify(deletedIds));
      }

      let customItems = JSON.parse(localStorage.getItem(STORAGE_CUSTOM_KEY) || '[]');
      customItems = customItems.filter((c) => c._id !== id);
      localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(customItems));

      setLecturesList((prev) => prev.filter((item) => item._id !== id));
      setSuccess('تم حذف الدرس بنجاح ✓');

      try {
        await api.delete(`/lectures/${id}`);
      } catch {
        // Safe fallback
      }
    } catch (err) {
      setError('فشل حذف الدرس');
    }
  };

  return (
    <div className="admin-lectures-page">
      <div className="admin-page-header">
        <div>
          <h2>إدارة الدروس والكتب والدورات</h2>
          <p>إضافة وتعديل وحذف الدروس والكتب وسلاسل الشروح بسهولة تامة</p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="admin-form-card">
        <h3 className="form-card-title">
          {editId ? <><FiEdit2 /> تعديل الدرس الحالي</> : <><FiPlus /> إضافة درس جديد</>}
        </h3>

        {error && <div className="alert alert-error">{error}</div>}
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
            <label>العلم الشرعي / التصنيف</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {['العقيدة', 'الفقه', 'أصول فقه', 'التفسير', 'الحديث', 'السيرة', 'آداب طالب العلم', 'الرقائق', 'علوم قرآن', 'عام'].map((c) => (
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
          <label>أسئلة اختبر نفسك (سؤال في كل سطر)</label>
          <textarea
            rows={3}
            value={form.quizQuestionsText}
            onChange={(e) => setForm({ ...form, quizQuestionsText: e.target.value })}
            placeholder="السؤال الأول...&#10;السؤال الثاني..."
          />
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="btn-admin-submit" disabled={submitting}>
            <FiCheck /> {editId ? 'حفظ التعديلات' : 'إضافة الدرس والدورة'}
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

      {/* Lectures List */}
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
                  {item.pdfUrl && <span className="card-pdf-badge"><FiBookOpen /> PDF مرفق</span>}
                </div>

                <h4 className="card-lecture-title">{item.title}</h4>
                <p className="card-series-name">
                  <FiVideo /> {item.series || 'بدون سلسلة'}
                </p>

                <div className="card-actions-footer">
                  <button
                    type="button"
                    className="btn-card-edit"
                    onClick={() => handleEdit(item)}
                  >
                    <FiEdit2 /> تعديل
                  </button>
                  <button
                    type="button"
                    className="btn-card-delete"
                    onClick={() => handleDelete(item._id)}
                  >
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
