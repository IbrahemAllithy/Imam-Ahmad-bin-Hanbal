import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import api from '../../services/api';
import { CATEGORIES, extractYoutubeId, getYoutubeEmbedUrl } from '../../utils/helpers';
import Loader from '../../components/ui/Loader';
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
  const { data, loading, refetch } = useFetch('/lectures', { limit: 100 });
  const [form, setForm] = useState(emptyLecture);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const previewId = extractYoutubeId(form.youtubeUrl);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const quizQuestions = form.quizQuestionsText
      ? form.quizQuestionsText.split('\n').map((q) => q.trim()).filter(Boolean)
      : [];

    const payload = {
      title: form.title,
      category: form.category,
      series: form.series,
      youtubeUrl: form.youtubeUrl,
      pdfUrl: form.pdfUrl,
      audioUrl: form.audioUrl,
      description: form.description,
      quizQuestions,
    };

    try {
      if (editId) {
        await api.put(`/lectures/${editId}`, payload);
        setSuccess('تم تحديث الدرس بنجاح ✓');
      } else {
        await api.post('/lectures', payload);
        setSuccess('تم إضافة الدرس والكتاب بنجاح ✓');
      }
      setForm(emptyLecture);
      setEditId(null);
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (lecture) => {
    setEditId(lecture._id);
    setForm({
      title: lecture.title,
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
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الدرس؟')) return;
    try {
      await api.delete(`/lectures/${id}`);
      setSuccess('تم حذف الدرس');
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل حذف الدرس');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>إدارة الدروس والكتب والدورات</h2>
          <p>إضافة وتعديل وحذف الدروس، السلاسل، روابط الكتب PDF، والملفات الصوتية</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="form-row">
          <div className="form-group">
            <label>عنوان الدرس / المجلس (مثال: التعليق على كتاب القواعد المثلى — المجلس 1)</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="عنوان الدرس..."
            />
          </div>

          <div className="form-group">
            <label>اسم الكتاب أو السلسلة (مثال: التعليق على كتاب القواعد المثلى)</label>
            <input
              value={form.series}
              onChange={(e) => setForm({ ...form, series: e.target.value })}
              placeholder="اسم الكتاب أو السلسلة لتجميع الدروس تحتها..."
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>العلم الشرعي / التصنيف</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {['العقيدة', 'الفقه', 'أصول فقه', 'التفسير', 'الحديث', 'السيرة', 'آداب طالب العلم', 'الرقائق', 'علوم قرآن', 'مصطلح حديث', 'عام'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>رابط فيديو اليوتيوب</label>
            <input
              value={form.youtubeUrl}
              onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
              required
              placeholder="https://youtu.be/..."
            />
          </div>
        </div>

        {previewId && (
          <div className="youtube-preview" style={{ marginBottom: '20px' }}>
            <iframe src={getYoutubeEmbedUrl(previewId)} title="معاينة الفيديو" allowFullScreen />
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>رابط الكتاب PDF (مثل رابط Archive.org المباشر)</label>
            <input
              value={form.pdfUrl}
              onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
              placeholder="https://archive.org/embed/... أو رابط PDF"
            />
          </div>

          <div className="form-group">
            <label>رابط الملف الصوتي (MP3 للاستماع الصوت المباشر)</label>
            <input
              value={form.audioUrl}
              onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
              placeholder="https://.../audio.mp3"
            />
          </div>
        </div>

        <div className="form-group">
          <label>أسئلة اختبر نفسك (كل سؤال في سطر جديد)</label>
          <textarea
            rows={3}
            value={form.quizQuestionsText}
            onChange={(e) => setForm({ ...form, quizQuestionsText: e.target.value })}
            placeholder="اكتب أسئلة الدرس، سؤال في كل سطر..."
          />
        </div>

        <div className="form-group">
          <label>وصف وتفريغ الدرس</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="تفريغ الدرس أو الملاحظات..."
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {editId ? 'تحديث الدرس' : 'إضافة الدرس والدورة'}
          </button>
          {editId && (
            <button
              type="button"
              className="btn btn-outline"
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

      {loading ? (
        <Loader />
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>العنوان</th>
              <th>الكتاب / السلسلة</th>
              <th>التصنيف</th>
              <th>الكتاب PDF</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((l) => (
              <tr key={l._id}>
                <td><strong>{l.title}</strong></td>
                <td>{l.series || '—'}</td>
                <td>{l.category}</td>
                <td>{l.pdfUrl ? 'مرفق ✓' : 'لا يوجد'}</td>
                <td>
                  <button type="button" className="btn-sm btn-outline" onClick={() => handleEdit(l)}>
                    تعديل
                  </button>
                  <button
                    type="button"
                    className="btn-sm btn-outline danger"
                    onClick={() => handleDelete(l._id)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminLectures;
