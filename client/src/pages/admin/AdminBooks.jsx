import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import api from '../../services/api';
import { CATEGORIES } from '../../utils/helpers';
import Loader from '../../components/ui/Loader';
import './Admin.css';

const emptyBook = { title: '', author: '', description: '', pages: 1, category: 'عام' };

const AdminBooks = () => {
  const { data, loading, refetch } = useFetch('/books', { limit: 50 });
  const [form, setForm] = useState(emptyBook);
  const [pdf, setPdf] = useState(null);
  const [cover, setCover] = useState(null);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (pdf) formData.append('pdf', pdf);
    if (cover) formData.append('coverImage', cover);

    try {
      if (editId) {
        await api.put(`/books/${editId}`, formData);
        setSuccess('تم تحديث الكتاب');
      } else {
        if (!pdf) {
          setError('ملف PDF مطلوب');
          setSubmitting(false);
          return;
        }
        await api.post('/books', formData);
        setSuccess('تم إضافة الكتاب');
      }
      setForm(emptyBook);
      setPdf(null);
      setCover(null);
      setEditId(null);
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (book) => {
    setEditId(book._id);
    setForm({
      title: book.title,
      author: book.author,
      description: book.description || '',
      pages: book.pages || 1,
      category: book.category,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await api.delete(`/books/${id}`);
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل الحذف');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>إدارة الكتب</h2>
          <p>رفع وتعديل كتب PDF مع أغلفة</p>
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
            <label>المؤلف</label>
            <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>التصنيف</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.filter((c) => c !== 'الكل').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>عدد الصفحات</label>
            <input type="number" min={1} value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} />
          </div>
        </div>

        <div className="form-group">
          <label>الوصف</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>ملف PDF {editId && '(اختياري للتحديث)'}</label>
            <input type="file" accept=".pdf" onChange={(e) => setPdf(e.target.files[0])} required={!editId} />
          </div>
          <div className="form-group">
            <label>صورة الغلاف</label>
            <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setCover(e.target.files[0])} />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {editId ? 'تحديث' : 'إضافة'}
          </button>
          {editId && (
            <button type="button" className="btn btn-outline" onClick={() => { setEditId(null); setForm(emptyBook); }}>
              إلغاء
            </button>
          )}
        </div>
      </form>

      {loading ? <Loader /> : (
        <table className="admin-table">
          <thead>
            <tr><th>العنوان</th><th>المؤلف</th><th>إجراءات</th></tr>
          </thead>
          <tbody>
            {data?.data?.map((b) => (
              <tr key={b._id}>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td>
                  <button type="button" className="btn-sm btn-outline" onClick={() => handleEdit(b)}>تعديل</button>
                  <button type="button" className="btn-sm btn-outline danger" onClick={() => handleDelete(b._id)}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminBooks;
