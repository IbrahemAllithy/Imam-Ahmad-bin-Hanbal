import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useSiteSettings } from '../../context/SiteSettingsContext';
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

const AdminLectures = () => {
  const { data, loading, error: fetchError, refetch } = useFetch('/lectures', { limit: 100 });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const quizQuestions = form.quizQuestionsText
      ? form.quizQuestionsText.split('\n').map((q) => q.trim()).filter(Boolean)
      : [];

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
      youtubeUrl: form.youtubeUrl,
      youtubeId,
      pdfUrl: form.pdfUrl || '',
      audioUrl: form.audioUrl || '',
      description: form.description || '',
      quizQuestions,
    };

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
