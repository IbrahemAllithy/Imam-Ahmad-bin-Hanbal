import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { formatDate } from '../../utils/helpers';
import Loader from '../../components/ui/Loader';
import { FiAward, FiTrash2, FiSend, FiSearch } from 'react-icons/fi';
import './Admin.css';

const AdminCertificates = () => {
  const { showSuccess, showError } = useToast();
  const { data, loading, error: fetchError, refetch } = useFetch('/admin/certificates', {
    limit: 100,
  });
  const { data: studentsData } = useFetch('/admin/students', { limit: 500 });

  const certificates = data?.data || [];
  const students = studentsData?.data || [];

  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ userId: '', series: '' });
  const [submitting, setSubmitting] = useState(false);

  const filtered = certificates.filter((c) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      c.series?.toLowerCase().includes(q) ||
      c.user?.name?.toLowerCase().includes(q) ||
      c.user?.email?.toLowerCase().includes(q) ||
      c.code?.toLowerCase().includes(q)
    );
  });

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!form.userId || !form.series.trim()) {
      showError('اختر الطالب واكتب اسم الدورة');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/admin/certificates', form);
      showSuccess('تم إصدار الشهادة بنجاح');
      setForm({ userId: '', series: '' });
      refetch();
    } catch (err) {
      showError(err.response?.data?.message || 'فشل إصدار الشهادة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (cert) => {
    if (!window.confirm(`إلغاء شهادة «${cert.series}» الخاصة بـ ${cert.user?.name}؟`)) return;
    try {
      await api.delete(`/admin/certificates/${cert._id}`);
      showSuccess('تم إلغاء الشهادة');
      refetch();
    } catch (err) {
      showError(err.response?.data?.message || 'فشل إلغاء الشهادة');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>الشهادات</h2>
          <p>عرض كل الشهادات الصادرة، وإصدار شهادة يدوياً، أو إلغاء شهادة</p>
        </div>
      </div>

      {fetchError && <div className="alert alert-error">{fetchError}</div>}

      <form onSubmit={handleIssue} className="admin-form-card" style={{ marginBottom: 20 }}>
        <h3 className="form-card-title">
          <FiSend /> إصدار شهادة يدوياً
        </h3>
        <div className="form-grid">
          <div className="form-group">
            <label>الطالب</label>
            <select
              value={form.userId}
              onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
              required
            >
              <option value="">اختر طالباً...</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} — {s.email}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>اسم الدورة (series)</label>
            <input
              value={form.series}
              onChange={(e) => setForm((f) => ({ ...f, series: e.target.value }))}
              placeholder="لازم يطابق اسم السلسلة بالظبط كما في صفحة الدروس"
              required
            />
          </div>
        </div>
        <div className="form-actions-bar">
          <button type="submit" className="btn-admin-submit" disabled={submitting}>
            <FiAward /> {submitting ? 'جارٍ الإصدار...' : 'إصدار الشهادة'}
          </button>
        </div>
      </form>

      <div className="admin-form-card" style={{ marginBottom: 20 }}>
        <div className="form-group">
          <label>
            <FiSearch /> بحث في الشهادات
          </label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="اسم الطالب، البريد، الدورة، أو الكود"
          />
        </div>
      </div>

      {loading && !certificates.length ? (
        <Loader />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>الطالب</th>
                <th>الدورة</th>
                <th>الكود</th>
                <th>تاريخ الإصدار</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c._id}>
                  <td>
                    {c.user?.name || '—'}
                    <br />
                    <small style={{ color: 'var(--text-muted)' }}>{c.user?.email}</small>
                  </td>
                  <td>{c.series}</td>
                  <td>{c.code}</td>
                  <td>{formatDate(c.issuedAt)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-card-delete"
                      onClick={() => handleRevoke(c)}
                    >
                      <FiTrash2 /> إلغاء
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>
                    لا توجد شهادات صادرة بعد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCertificates;
