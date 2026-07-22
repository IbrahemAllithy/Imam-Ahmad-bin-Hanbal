import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import { FiEdit2, FiTrash2, FiBookOpen, FiPlus, FiCheck, FiDownload } from 'react-icons/fi';
import './Admin.css';

const emptyBook = {
  title: '',
  author: 'فضيلة الشيخ شعبان العودة',
  category: 'العقيدة',
  pages: 50,
  pdfUrl: '',
  description: '',
};

const STORAGE_BOOKS_KEY = 'custom_admin_books_v2';
const STORAGE_DELETED_BOOKS_KEY = 'deleted_admin_book_ids_v2';

const saveLocalBook = (payload, editId) => {
  let customItems = JSON.parse(localStorage.getItem(STORAGE_BOOKS_KEY) || '[]');
  if (editId) {
    customItems = customItems.map((item) => (item._id === editId ? { ...item, ...payload } : item));
    if (!customItems.some((c) => c._id === editId)) customItems.push(payload);
  } else {
    customItems.unshift(payload);
  }
  localStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(customItems));
};

const deleteLocalBook = (id) => {
  let deletedIds = JSON.parse(localStorage.getItem(STORAGE_DELETED_BOOKS_KEY) || '[]');
  if (!deletedIds.includes(id)) {
    deletedIds.push(id);
    localStorage.setItem(STORAGE_DELETED_BOOKS_KEY, JSON.stringify(deletedIds));
  }
  let customItems = JSON.parse(localStorage.getItem(STORAGE_BOOKS_KEY) || '[]');
  customItems = customItems.filter((c) => c._id !== id);
  localStorage.setItem(STORAGE_BOOKS_KEY, JSON.stringify(customItems));
};

const AdminBooks = () => {
  const { data, loading, refetch } = useFetch('/books', { limit: 100 });
  const { categoryNames } = useSiteSettings();
  const [form, setForm] = useState(emptyBook);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const booksList = data?.data || [];
  const categories = categoryNames.length
    ? categoryNames
    : ['العقيدة', 'الفقه', 'أصول فقه', 'التفسير', 'الحديث', 'السيرة', 'آداب طالب العلم', 'عام'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const payload = {
      title: form.title,
      author: form.author || 'فضيلة الشيخ شعبان العودة',
      category: form.category,
      pages: Number(form.pages) || 50,
      pdfUrl: form.pdfUrl,
      description: form.description || '',
    };

    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([k, v]) => formData.append(k, v));

      if (editId) {
        await api.put(`/books/${editId}`, formData);
        setSuccess('تم تحديث الكتاب على السيرفر ✓');
      } else {
        await api.post('/books', formData);
        setSuccess('تم إضافة الكتاب على السيرفر ✓');
      }
      setForm(emptyBook);
      setEditId(null);
      refetch();
    } catch (err) {
      const localPayload = {
        ...payload,
        _id: editId || `custom-book-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      saveLocalBook(localPayload, editId);
      setSuccess(
        editId
          ? 'تم حفظ التعديل محلياً (السيرفر غير متصل أو جلسة تجريبية)'
          : 'تم إضافة الكتاب محلياً (السيرفر غير متصل أو جلسة تجريبية)'
      );
      setForm(emptyBook);
      setEditId(null);
      refetch();
      if (err.response?.status && err.response.status !== 401) {
        setError(err.response?.data?.message || '');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (book) => {
    setEditId(book._id);
    setForm({
      title: book.title || '',
      author: book.author || 'فضيلة الشيخ شعبان العودة',
      category: book.category || categories[0] || 'العقيدة',
      pages: book.pages || 50,
      pdfUrl: book.pdfUrl || '',
      description: book.description || '',
    });
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الكتاب؟')) return;
    try {
      await api.delete(`/books/${id}`);
      setSuccess('تم حذف الكتاب ✓');
      refetch();
    } catch {
      deleteLocalBook(id);
      setSuccess('تم الحذف محلياً (السيرفر غير متصل أو جلسة تجريبية)');
      refetch();
    }
  };

  return (
    <div className="admin-books-page">
      <div className="admin-page-header">
        <div>
          <h2>إدارة المكتبة والكتب PDF</h2>
          <p>إضافة وتعديل وحذف مؤلفات وكتب الشيخ ورابط قراءتها بالـ PDF</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-card">
        <h3 className="form-card-title">
          {editId ? <><FiEdit2 /> تعديل الكتاب الحالي</> : <><FiPlus /> إضافة كتاب جديد للمكتبة</>}
        </h3>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="form-grid">
          <div className="form-group">
            <label>عنوان الكتاب *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="مثال: كتاب القواعد المثلى في صفات الله وأسمائه الحسنى"
            />
          </div>

          <div className="form-group">
            <label>المؤلف / الشارح *</label>
            <input
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>التصنيف الشرعي</label>
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
            <label>عدد الصفحات</label>
            <input
              type="number"
              min={1}
              value={form.pages}
              onChange={(e) => setForm({ ...form, pages: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>رابط القراءة والتصفح PDF *</label>
          <input
            value={form.pdfUrl}
            onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
            required
            placeholder="https://archive.org/embed/..."
          />
        </div>

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>وصف الكتاب والتعريف به</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="نبذة عن موضوع الكتاب ومحتواه العلمي..."
          />
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="btn-admin-submit" disabled={submitting}>
            <FiCheck /> {editId ? 'حفظ التعديلات' : 'إضافة الكتاب للمكتبة'}
          </button>
          {editId && (
            <button
              type="button"
              className="btn-admin-cancel"
              onClick={() => {
                setEditId(null);
                setForm(emptyBook);
              }}
            >
              إلغاء التعديل
            </button>
          )}
        </div>
      </form>

      <div className="admin-list-section">
        <div className="list-section-header">
          <h3>كتب ومؤلفات المكتبة ({booksList.length})</h3>
        </div>

        {loading && !booksList.length ? (
          <Loader />
        ) : (
          <div className="admin-cards-grid">
            {booksList.map((item) => (
              <div key={item._id} className="admin-lecture-card">
                <div className="card-badge-row">
                  <span className="card-cat-badge">{item.category}</span>
                  <span className="card-pdf-badge"><FiBookOpen /> {item.pages} صفحة</span>
                </div>

                <h4 className="card-lecture-title">{item.title}</h4>
                <p className="card-series-name">
                  <FiDownload /> {item.author}
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

            {!booksList.length && (
              <p className="empty-list-msg">لا توجد كتب مضافة في المكتبة حتى الآن.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBooks;
