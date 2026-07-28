import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import RichTextEditor from '../../components/admin/RichTextEditor';
import { FiEdit2, FiTrash2, FiPlus, FiCheck, FiFileText } from 'react-icons/fi';
import './Admin.css';

const emptyArticle = { title: '', content: '', excerpt: '', category: 'عام', publishedAt: '' };

const toDatetimeLocal = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const AdminArticles = () => {
  const { data, loading, refetch } = useFetch('/articles', { limit: 100, all: 1 });
  const { categoryNames } = useSiteSettings();
  const [form, setForm] = useState(emptyArticle);
  const [cover, setCover] = useState(null);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = categoryNames.length
    ? categoryNames
    : ['عقيدة', 'فقه', 'تفسير', 'حديث', 'سيرة', 'آداب', 'عام'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'publishedAt' && v) {
        formData.append(k, new Date(v).toISOString());
      } else if (k !== 'publishedAt' || v) {
        formData.append(k, v);
      }
    });
    if (cover) formData.append('coverImage', cover);

    try {
      if (editId) {
        await api.put(`/articles/${editId}`, formData);
        setSuccess('تم تحديث المقال');
      } else {
        await api.post('/articles', formData);
        setSuccess('تم إضافة المقال');
      }
      setForm(emptyArticle);
      setCover(null);
      setEditId(null);
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (article) => {
    setEditId(article._id);
    setForm({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || '',
      category: article.category,
      publishedAt: toDatetimeLocal(article.publishedAt),
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await api.delete(`/articles/${id}`);
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل الحذف');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>إدارة المقالات</h2>
          <p>إضافة وتعديل وحذف المقالات العلمية</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-card">
        <h3 className="form-card-title">
          {editId ? <><FiEdit2 /> تعديل المقال</> : <><FiPlus /> إضافة مقال جديد</>}
        </h3>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="form-grid">
          <div className="form-group">
            <label>العنوان</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>التصنيف</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>المقتطف</label>
            <input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="ملخّص قصير يظهر في قائمة المقالات" />
          </div>

          <div className="form-group">
            <label>موعد النشر (اتركه فارغاً للنشر الفوري)</label>
            <input
              type="datetime-local"
              value={form.publishedAt || ''}
              onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>صورة الغلاف</label>
            <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setCover(e.target.files[0])} />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>محتوى المقال</label>
          <RichTextEditor
            value={form.content}
            onChange={(html) => setForm((f) => ({ ...f, content: html }))}
          />
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="btn-admin-submit" disabled={submitting}>
            <FiCheck /> {editId ? 'حفظ التعديلات' : 'إضافة المقال'}
          </button>
          {editId && (
            <button type="button" className="btn-admin-cancel" onClick={() => { setEditId(null); setForm(emptyArticle); }}>
              إلغاء التعديل
            </button>
          )}
        </div>
      </form>

      <div className="admin-list-section">
        <div className="list-section-header">
          <h3>المقالات المنشورة ({data?.data?.length || 0})</h3>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th><FiFileText /> العنوان</th>
                  <th>التصنيف</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((a) => (
                  <tr key={a._id}>
                    <td>{a.title}</td>
                    <td>{a.category}</td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="btn-card-edit" onClick={() => handleEdit(a)}>
                        <FiEdit2 /> تعديل
                      </button>
                      <button type="button" className="btn-card-delete" onClick={() => handleDelete(a._id)}>
                        <FiTrash2 /> حذف
                      </button>
                    </td>
                  </tr>
                ))}
                {!data?.data?.length && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center' }}>لا توجد مقالات مضافة حتى الآن.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminArticles;
