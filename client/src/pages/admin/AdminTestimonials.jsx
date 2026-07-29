import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getStorageUrl } from '../../services/api';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import { FiEdit2, FiTrash2, FiPlus, FiCheck, FiMessageSquare } from 'react-icons/fi';
import './Admin.css';

const emptyForm = { name: '', title: '', quote: '' };

const AdminTestimonials = () => {
  const { data, loading, error: fetchError, refetch } = useFetch('/testimonials');
  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const items = data?.data || [];

  const resetForm = () => {
    setForm(emptyForm);
    setPhotoFile(null);
    setVideoFile(null);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim() || !form.quote.trim()) {
      setError('الاسم ونص الشهادة مطلوبان');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('title', form.title || '');
      formData.append('quote', form.quote);
      if (photoFile) formData.append('photo', photoFile);
      if (videoFile) formData.append('video', videoFile);

      if (editId) {
        await api.put(`/testimonials/${editId}`, formData);
        setSuccess('تم تحديث الشهادة ✓');
      } else {
        await api.post('/testimonials', formData);
        setSuccess('تم إضافة الشهادة ✓');
      }
      resetForm();
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل الحفظ على السيرفر');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setForm({ name: item.name || '', title: item.title || '', quote: item.quote || '' });
    setPhotoFile(null);
    setVideoFile(null);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الشهادة؟')) return;
    setError('');
    try {
      await api.delete(`/testimonials/${id}`);
      setSuccess('تم حذف الشهادة ✓');
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل الحذف على السيرفر');
    }
  };

  return (
    <div className="admin-books-page">
      <div className="admin-page-header">
        <div>
          <h2>قالوا عن الموقع</h2>
          <p>الشهادات اللي تظهر في صفحة "قالوا عن الموقع"</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-card">
        <h3 className="form-card-title">
          {editId ? <><FiEdit2 /> تعديل الشهادة الحالية</> : <><FiPlus /> إضافة شهادة جديدة</>}
        </h3>

        {(error || fetchError) && <div className="alert alert-error">{error || fetchError}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="form-grid">
          <div className="form-group">
            <label>الاسم *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: الشيخ فلان الفلاني"
            />
          </div>
          <div className="form-group">
            <label>الصفة / الوصف</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="مثال: عضو هيئة كبار العلماء"
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>نص الشهادة *</label>
          <textarea
            rows={3}
            value={form.quote}
            onChange={(e) => setForm({ ...form, quote: e.target.value })}
            placeholder="نص ما قاله عن الموقع..."
          />
        </div>

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>صورة (اختياري)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
          />
          {photoFile && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              الملف المختار: {photoFile.name}
            </span>
          )}
        </div>

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>فيديو (اختياري)</label>
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          />
          {videoFile && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              الملف المختار: {videoFile.name}
            </span>
          )}
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="btn-admin-submit" disabled={submitting}>
            <FiCheck /> {editId ? 'حفظ التعديلات' : 'إضافة الشهادة'}
          </button>
          {editId && (
            <button type="button" className="btn-admin-cancel" onClick={resetForm}>
              إلغاء التعديل
            </button>
          )}
        </div>
      </form>

      <div className="admin-list-section">
        <div className="list-section-header">
          <h3>الشهادات ({items.length})</h3>
        </div>

        {loading && !items.length ? (
          <Loader />
        ) : (
          <div className="admin-cards-grid">
            {items.map((item) => (
              <div key={item._id} className="admin-lecture-card">
                {item.photo && (
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      marginBottom: 10,
                    }}
                  >
                    <img
                      src={getStorageUrl(item.photo)}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <h4 className="card-lecture-title">
                  <FiMessageSquare style={{ verticalAlign: 'middle', marginLeft: 4 }} />
                  {item.name}
                </h4>
                {item.title && <p className="card-series-name">{item.title}</p>}
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>"{item.quote}"</p>

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

            {!items.length && <p className="empty-list-msg">لا توجد شهادات مضافة حتى الآن.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTestimonials;
