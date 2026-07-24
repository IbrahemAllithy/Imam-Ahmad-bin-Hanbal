import { useState, Fragment } from 'react';
import { useFetch } from '../../hooks/useFetch';
import api from '../../services/api';
import { formatDate } from '../../utils/helpers';
import Loader from '../../components/ui/Loader';
import {
  FiTrash2,
  FiUsers,
  FiSearch,
  FiEdit2,
  FiChevronDown,
  FiChevronUp,
  FiShield,
  FiAward,
} from 'react-icons/fi';
import './Admin.css';

const EditStudentForm = ({ student, onCancel, onSaved }) => {
  const [form, setForm] = useState({
    name: student.name || '',
    phone: student.phone || '',
    country: student.country || '',
    role: student.role || 'student',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.patch(`/admin/users/${student._id}`, form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="admin-form-card" onSubmit={submit} style={{ marginTop: 10 }}>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-grid">
        <div className="form-group">
          <label>الاسم</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div className="form-group">
          <label>الهاتف</label>
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label>الدولة</label>
          <input
            value={form.country}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label>الدور</label>
          <select
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          >
            <option value="student">طالب</option>
            <option value="admin">أدمن</option>
          </select>
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-admin-submit" disabled={saving}>
          {saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
        </button>
        <button type="button" className="btn-admin-cancel" onClick={onCancel}>
          إلغاء
        </button>
      </div>
    </form>
  );
};

const StudentProgressPanel = ({ studentId }) => {
  const { data, loading, error } = useFetch(`/admin/students/${studentId}/progress`);
  const progress = data?.data?.progress || [];
  const certificates = data?.data?.certificates || [];

  if (loading) return <Loader />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="admin-form-card" style={{ marginTop: 10 }}>
      <h4 style={{ margin: '0 0 10px' }}>
        <FiAward /> الشهادات ({certificates.length})
      </h4>
      {certificates.length ? (
        <ul style={{ margin: '0 0 16px', paddingInlineStart: 20 }}>
          {certificates.map((c) => (
            <li key={c._id}>
              {c.series} — كود {c.code} — {formatDate(c.issuedAt)}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: 'var(--text-muted)' }}>لا توجد شهادات بعد.</p>
      )}

      <h4 style={{ margin: '0 0 10px' }}>الدروس المكتملة ({progress.length})</h4>
      {progress.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>الدرس</th>
                <th>الدورة</th>
                <th>تاريخ الإكمال</th>
                <th>درجة الاختبار</th>
              </tr>
            </thead>
            <tbody>
              {progress.map((p) => (
                <tr key={p._id}>
                  <td>{p.lecture?.title || '—'}</td>
                  <td>{p.lecture?.series || '—'}</td>
                  <td>{formatDate(p.completedAt)}</td>
                  <td>{p.quizScore != null ? `${p.quizScore}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)' }}>لم يكمل أي درس بعد.</p>
      )}
    </div>
  );
};

const AdminStudents = () => {
  const { data, loading, error: fetchError, refetch } = useFetch('/admin/students', { limit: 100 });
  const { data: adminsData, refetch: refetchAdmins } = useFetch('/admin/admins');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const students = data?.data || [];
  const admins = adminsData?.data || [];
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

  const refreshAll = () => {
    refetch();
    refetchAdmins();
    setEditingId(null);
  };

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

  const handleDeleteAdmin = async (admin) => {
    if (!window.confirm(`سحب صلاحية الأدمن وحذف حساب «${admin.name}»؟`)) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/admin/admins/${admin._id}`);
      setSuccess('تم حذف حساب الأدمن');
      refetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل حذف حساب الأدمن');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>الطلاب والمدراء</h2>
          <p>عرض وتعديل حسابات الطلاب، ومتابعة تقدمهم، وإدارة صلاحيات الأدمن</p>
        </div>
      </div>

      {(error || fetchError) && <div className="alert alert-error">{error || fetchError}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="admin-form-card" style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 12px' }}>
          <FiShield /> حسابات الأدمن ({admins.length})
        </h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>البريد</th>
                <th>تاريخ الإنشاء</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a._id}>
                  <td>{a.name}</td>
                  <td>{a.email}</td>
                  <td>{formatDate(a.createdAt)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-card-delete"
                      onClick={() => handleDeleteAdmin(a)}
                    >
                      <FiTrash2 /> حذف
                    </button>
                  </td>
                </tr>
              ))}
              {!admins.length && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>
                    لا يوجد حسابات أدمن.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                <Fragment key={student._id || student.email}>
                  <tr>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.phone || '—'}</td>
                    <td>{student.country || '—'}</td>
                    <td>{formatDate(student.createdAt)}</td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="btn-card-edit"
                        onClick={() =>
                          setEditingId(editingId === student._id ? null : student._id)
                        }
                      >
                        <FiEdit2 /> تعديل
                      </button>
                      <button
                        type="button"
                        className="btn-card-edit"
                        onClick={() =>
                          setExpandedId(expandedId === student._id ? null : student._id)
                        }
                      >
                        {expandedId === student._id ? <FiChevronUp /> : <FiChevronDown />} التقدم
                      </button>
                      <button
                        type="button"
                        className="btn-card-delete"
                        onClick={() => handleDelete(student)}
                      >
                        <FiTrash2 /> حذف
                      </button>
                    </td>
                  </tr>
                  {editingId === student._id && (
                    <tr>
                      <td colSpan={6}>
                        <EditStudentForm
                          student={student}
                          onCancel={() => setEditingId(null)}
                          onSaved={refreshAll}
                        />
                      </td>
                    </tr>
                  )}
                  {expandedId === student._id && (
                    <tr>
                      <td colSpan={6}>
                        <StudentProgressPanel studentId={student._id} />
                      </td>
                    </tr>
                  )}
                </Fragment>
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
