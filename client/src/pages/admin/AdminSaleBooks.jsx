import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getStorageUrl } from '../../services/api';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import { FiEdit2, FiTrash2, FiPlus, FiCheck, FiShoppingBag } from 'react-icons/fi';
import './Admin.css';

const AdminSaleBooks = () => {
  const { data, loading, error: fetchError, refetch } = useFetch('/sale-books');
  const [title, setTitle] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const books = data?.data || [];

  const resetForm = () => {
    setTitle('');
    setCoverFile(null);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editId && !coverFile) {
      setError('أرفق صورة غلاف الكتاب');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      if (coverFile) formData.append('coverImage', coverFile);

      if (editId) {
        await api.put(`/sale-books/${editId}`, formData);
        setSuccess('تم تحديث الكتاب ✓');
      } else {
        await api.post('/sale-books', formData);
        setSuccess('تم إضافة الكتاب ✓');
      }
      resetForm();
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل الحفظ على السيرفر');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (book) => {
    setEditId(book._id);
    setTitle(book.title || '');
    setCoverFile(null);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الكتاب؟')) return;
    setError('');
    try {
      await api.delete(`/sale-books/${id}`);
      setSuccess('تم حذف الكتاب ✓');
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل الحذف على السيرفر');
    }
  };

  return (
    <div className="admin-books-page">
      <div className="admin-page-header">
        <div>
          <h2>متجر الكتب (شراء الكتب)</h2>
          <p>الكروت اللي تظهر في صفحة "شراء الكتب"، والزائر يتواصل لشرائها عبر واتساب</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-card">
        <h3 className="form-card-title">
          {editId ? <><FiEdit2 /> تعديل الكتاب الحالي</> : <><FiPlus /> إضافة كتاب جديد للمتجر</>}
        </h3>

        {(error || fetchError) && <div className="alert alert-error">{error || fetchError}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>عنوان الكتاب</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: كتاب القواعد المثلى"
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>صورة الغلاف {editId ? '(اختياري عند التعديل)' : '*'}</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          />
          {coverFile && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              الملف المختار: {coverFile.name}
            </span>
          )}
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="btn-admin-submit" disabled={submitting}>
            <FiCheck /> {editId ? 'حفظ التعديلات' : 'إضافة الكتاب'}
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
          <h3>كتب المتجر ({books.length})</h3>
        </div>

        {loading && !books.length ? (
          <Loader />
        ) : (
          <div className="admin-cards-grid">
            {books.map((item) => (
              <div key={item._id} className="admin-lecture-card">
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '2/3',
                    borderRadius: 10,
                    overflow: 'hidden',
                    marginBottom: 10,
                    background: 'oklch(0.94 0.01 255)',
                  }}
                >
                  <img
                    src={getStorageUrl(item.coverImage)}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <h4 className="card-lecture-title">
                  <FiShoppingBag style={{ verticalAlign: 'middle', marginLeft: 4 }} />
                  {item.title}
                </h4>

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

            {!books.length && <p className="empty-list-msg">لا توجد كتب مضافة في المتجر حتى الآن.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSaleBooks;
