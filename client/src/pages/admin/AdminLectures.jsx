import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import api from '../../services/api';
import { CATEGORIES, extractYoutubeId, getYoutubeEmbedUrl } from '../../utils/helpers';
import Loader from '../../components/ui/Loader';
import './Admin.css';

const emptyLecture = { title: '', youtubeUrl: '', description: '', series: '', category: 'عام' };

const AdminLectures = () => {
  const { data, loading, refetch } = useFetch('/lectures', { limit: 50 });
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
    try {
      if (editId) {
        await api.put(`/lectures/${editId}`, form);
        setSuccess('تم تحديث المحاضرة');
      } else {
        await api.post('/lectures', form);
        setSuccess('تم إضافة المحاضرة');
      }
      setForm(emptyLecture);
      setEditId(null);
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (lecture) => {
    setEditId(lecture._id);
    setForm({
      title: lecture.title,
      youtubeUrl: lecture.youtubeUrl,
      description: lecture.description || '',
      series: lecture.series || '',
      category: lecture.category,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await api.delete(`/lectures/${id}`);
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل الحذف');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>إدارة المحاضرات</h2>
          <p>إضافة وتعديل وحذف محاضرات يوتيوب</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="form-row">
          <div className="form-group">
            <label>العنوان</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>التصنيف</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.filter((c) => c !== 'الكل').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>رابط اليوتيوب</label>
          <input value={form.youtubeUrl} onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })} required placeholder="https://youtube.com/watch?v=..." />
        </div>

        {previewId && (
          <div className="youtube-preview">
            <iframe src={getYoutubeEmbedUrl(previewId)} title="معاينة" allowFullScreen />
          </div>
        )}

        <div className="form-group">
          <label>السلسلة</label>
          <input value={form.series} onChange={(e) => setForm({ ...form, series: e.target.value })} />
        </div>

        <div className="form-group">
          <label>الوصف</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {editId ? 'تحديث' : 'إضافة'}
          </button>
          {editId && (
            <button type="button" className="btn btn-outline" onClick={() => { setEditId(null); setForm(emptyLecture); }}>
              إلغاء
            </button>
          )}
        </div>
      </form>

      {loading ? <Loader /> : (
        <table className="admin-table">
          <thead>
            <tr><th>العنوان</th><th>التصنيف</th><th>إجراءات</th></tr>
          </thead>
          <tbody>
            {data?.data?.map((l) => (
              <tr key={l._id}>
                <td>{l.title}</td>
                <td>{l.category}</td>
                <td>
                  <button type="button" className="btn-sm btn-outline" onClick={() => handleEdit(l)}>تعديل</button>
                  <button type="button" className="btn-sm btn-outline danger" onClick={() => handleDelete(l._id)}>حذف</button>
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
