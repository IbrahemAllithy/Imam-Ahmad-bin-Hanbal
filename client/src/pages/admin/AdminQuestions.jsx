import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import api from '../../services/api';
import { formatDate } from '../../utils/helpers';
import Loader from '../../components/ui/Loader';
import { FiMessageCircle, FiTrash2 } from 'react-icons/fi';
import './Admin.css';

const STATUS_OPTIONS = [
  { value: '', label: 'الكل' },
  { value: 'pending', label: 'بانتظار الرد' },
  { value: 'answered', label: 'تم الرد' },
];

const PAGE_SIZE = 20;

const AdminQuestions = () => {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const params = { limit: PAGE_SIZE, page, ...(statusFilter && { status: statusFilter }) };
  const { data, loading, error, refetch } = useFetch('/lesson-questions/admin', params, [statusFilter, page]);
  const [replies, setReplies] = useState({});
  const [submitting, setSubmitting] = useState(null);
  const [success, setSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const questions = data?.data || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: questions.length };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleDelete = async (qId) => {
    if (!window.confirm('حذف هذا السؤال نهائياً؟')) return;
    setActionError('');
    try {
      await api.delete(`/lesson-questions/admin/${qId}`);
      refetch();
    } catch (err) {
      setActionError(err.response?.data?.message || 'فشل حذف السؤال');
    }
  };

  const handleReply = async (qId) => {
    const adminReply = (replies[qId] || '').trim();
    if (!adminReply) return;
    setSubmitting(qId);
    setSuccess('');
    setActionError('');
    try {
      await api.patch(`/lesson-questions/admin/${qId}`, {
        adminReply,
        status: 'answered',
      });
      setSuccess('تم إرسال الرد بنجاح');
      setReplies((prev) => ({ ...prev, [qId]: '' }));
      refetch();
    } catch (err) {
      setActionError(err.response?.data?.message || 'فشل إرسال الرد');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="admin-questions-page">
      <div className="admin-page-header">
        <div>
          <h2>
            <FiMessageCircle style={{ marginLeft: 8 }} />
            أسئلة الدروس
          </h2>
          <p>الرد على أسئلة الطلاب حول الدروس</p>
        </div>
      </div>

      <div className="admin-form-card" style={{ marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label>تصفية حسب الحالة</label>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {actionError && <div className="alert alert-error">{actionError}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading ? (
        <Loader />
      ) : questions.length ? (
        <div className="admin-list-section">
          {questions.map((q) => (
            <div key={q._id} className="admin-form-card" style={{ marginBottom: '1rem' }}>
              <div className="card-badge-row">
                <span className="card-cat-badge">{q.status}</span>
                <span className="card-pdf-badge">{formatDate(q.createdAt)}</span>
                <button
                  type="button"
                  className="btn-card-delete"
                  style={{ marginInlineStart: 'auto' }}
                  onClick={() => handleDelete(q._id)}
                >
                  <FiTrash2 /> حذف
                </button>
              </div>
              <p style={{ margin: '0.5rem 0', fontWeight: 700 }}>
                {q.lecture?.title || 'درس'}
                {q.lecture?.series && ` — ${q.lecture.series}`}
              </p>
              <p style={{ margin: '0.5rem 0' }}>
                <strong>{q.user?.name || 'طالب'}:</strong> {q.question}
              </p>
              {q.adminReply && (
                <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0' }}>
                  <strong>الرد:</strong> {q.adminReply}
                </p>
              )}
              {q.status === 'pending' && (
                <div style={{ marginTop: '1rem' }}>
                  <textarea
                    rows={3}
                    value={replies[q._id] || ''}
                    onChange={(e) =>
                      setReplies((prev) => ({ ...prev, [q._id]: e.target.value }))
                    }
                    placeholder="اكتب ردك..."
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--primary-border)' }}
                  />
                  <button
                    type="button"
                    className="btn-admin-submit"
                    style={{ marginTop: '0.5rem' }}
                    disabled={submitting === q._id}
                    onClick={() => handleReply(q._id)}
                  >
                    {submitting === q._id ? 'جاري الإرسال...' : 'إرسال الرد'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-list-msg">لا توجد أسئلة {statusFilter === 'pending' ? 'معلقة' : ''}.</p>
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

export default AdminQuestions;
