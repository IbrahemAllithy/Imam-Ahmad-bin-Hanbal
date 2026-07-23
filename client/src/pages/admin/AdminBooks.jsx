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

const AdminBooks = () => {
  const { data, loading, error: fetchError, refetch } = useFetch('/books', { limit: 100 });
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
        setSuccess('تم تحديث الكتاب — يظهر الآن في المكتبة ✓');
      } else {
        await api.post('/books', formData);
        setSuccess('تم إضافة الكتاب — يظهر الآن في المكتبة ✓');
      }
      setForm(emptyBook);
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
    setError('');
    try {
      await api.delete(`/books/${id}`);
      setSuccess('تم حذف الكتاب من الموقع ✓');
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل الحذف على السيرفر');
    }
  };

  return (
    <div className="admin-books-page">
      <div className="admin-page-header">
        <div>
          <h2>إدارة المكتبة والكتب PDF</h2>
          <p>أي إضافة أو تعديل يُحفظ على السيرفر ويظهر مباشرة للزوار</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-card">
        <h3 className="form-card-title">
          {editId ? <><FiEdit2 /> تعديل الكتاب الحالي</> : <><FiPlus /> إضافة كتاب جديد للمكتبة</>}
        </h3>

        {(error || fetchError) && (
          <div className="alert alert-error">{error || fetchError}</div>
        )}
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
            <FiCheck /> {editId ? 'حفظ ونشر التعديلات' : 'إضافة ونشر الكتاب'}
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
