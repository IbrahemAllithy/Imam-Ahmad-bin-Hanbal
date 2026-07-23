import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import api from '../../services/api';
import { formatDate } from '../../utils/helpers';
import Loader from '../../components/ui/Loader';
import { FiTrash2, FiUsers, FiSearch } from 'react-icons/fi';
import './Admin.css';

const AdminStudents = () => {
  const { data, loading, error: fetchError, refetch } = useFetch('/admin/students', { limit: 100 });
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const students = data?.data || [];
  const filtered = students.filter((s) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q) ||
      s.country?.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (student) => {
    if (!window.confirm(`حذف حساب الطالب «${student.name}»؟`)) return;
    setError('');
    setSuccess('');

    try {
      await api.delete(`/admin/students/${student._id}`);
      setSuccess('تم حذف حساب الطالب من السيرفر');
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل حذف الحساب على السيرفر');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>الطلاب المسجّلون</h2>
          <p>عرض وحذف حسابات الطلاب المسجّلين في الموقع</p>
        </div>
      </div>

      {(error || fetchError) && (
        <div className="alert alert-error">{error || fetchError}</div>
      )}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="admin-form-card" style={{ marginBottom: 20 }}>
        <div className="form-group">
          <label>
            <FiSearch /> بحث عن طالب
          </label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="الاسم أو البريد أو الهاتف أو الدولة"
          />
        </div>
        <p style={{ margin: '8px 0 0', color: 'var(--text-muted)' }}>
          <FiUsers /> العدد الظاهر: {filtered.length}
        </p>
      </div>

      {loading && !students.length ? (
        <Loader />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>البريد</th>
                <th>الهاتف</th>
                <th>الدولة</th>
                <th>تاريخ التسجيل</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student._id || student.email}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.phone || '—'}</td>
                  <td>{student.country || '—'}</td>
                  <td>{formatDate(student.createdAt)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-card-delete"
                      onClick={() => handleDelete(student)}
                    >
                      <FiTrash2 /> حذف
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>
                    لا يوجد طلاب مسجّلون بعد.
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

export default AdminStudents;
