import { useState, useEffect } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { formatDate } from '../../utils/helpers';
import Loader from '../../components/ui/Loader';
import { FiAward, FiTrash2, FiSend, FiSearch } from 'react-icons/fi';
import './Admin.css';

const PAGE_SIZE = 20;

const AdminCertificates = () => {
  const { showSuccess, showError } = useToast();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, loading, error: fetchError, refetch } = useFetch('/admin/certificates', {
    limit: PAGE_SIZE,
    page,
    ...(debouncedSearch && { search: debouncedSearch }),
  });
  const { data: studentsData } = useFetch('/admin/students', { limit: 500 });
  const { data: seriesData } = useFetch('/lectures/series/list');

  const certificates = data?.data || [];
  const students = studentsData?.data || [];
  const seriesOptions = seriesData?.data || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: certificates.length };

  const [form, setForm] = useState({ userId: '', series: '' });
  const [submitting, setSubmitting] = useState(false);

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
            <select
              value={form.series}
              onChange={(e) => setForm((f) => ({ ...f, series: e.target.value }))}
              required
            >
              <option value="">اختر دورة...</option>
              {seriesOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
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
            placeholder="اسم الدورة أو الكود"
          />
        </div>
        <p style={{ margin: '8px 0 0', color: 'var(--text-muted)' }}>
          إجمالي الشهادات: {pagination.total} — صفحة {pagination.page} من {pagination.pages || 1}
        </p>
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
              {certificates.map((c) => (
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
              {!certificates.length && (
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

      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 16 }}>
          <button
            type="button"
            className="btn-card-edit"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            السابق
          </button>
          <span style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>
            {pagination.page} / {pagination.pages}
          </span>
          <button
            type="button"
            className="btn-card-edit"
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminCertificates;
