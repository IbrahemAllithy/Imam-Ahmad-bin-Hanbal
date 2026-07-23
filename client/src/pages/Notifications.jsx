import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import Loader from '../components/ui/Loader';
import './PlatformPages.css';
import './Auth.css';

const Notifications = () => {
  const { user, loading: authLoading, isStudent, isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setItems(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'تعذر تحميل التنبيهات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (isStudent || isAdmin)) fetchNotifications();
  }, [user, isStudent, isAdmin]);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (err) {
      setError(err.response?.data?.message || 'تعذر تعليم التنبيه كمقروء');
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setError(err.response?.data?.message || 'تعذر تعليم التنبيهات كمقروءة');
    }
  };

  if (authLoading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isStudent && !isAdmin) return <Navigate to="/login" replace />;

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>التنبيهات</h1>
          <p>{unreadCount ? `${unreadCount} تنبيه غير مقروء` : 'جميع التنبيهات مقروءة'}</p>
        </div>
      </div>

      <div className="platform-page">
        <div className="container">
          {error && <div className="alert alert-error">{error}</div>}

          {unreadCount > 0 && (
            <div className="notification-actions">
              <button type="button" className="btn btn-outline" onClick={markAllRead}>
                تعليم الكل كمقروء
              </button>
            </div>
          )}

          {loading ? (
            <Loader />
          ) : items.length ? (
            items.map((item) => (
              <div
                key={item._id}
                className={`notification-item ${!item.read ? 'unread' : ''}`}
              >
                <div>
                  <strong>{item.title}</strong>
                  {item.body && <p style={{ margin: '0.35rem 0', color: 'var(--text-muted)' }}>{item.body}</p>}
                  <span className="platform-card-meta">{formatDate(item.createdAt)}</span>
                  {item.link && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <Link to={item.link} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                        عرض
                      </Link>
                    </div>
                  )}
                </div>
                {!item.read && (
                  <button type="button" className="btn btn-outline" onClick={() => markRead(item._id)}>
                    مقروء
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="platform-empty" style={{ textAlign: 'center' }}>
              <p>لا توجد تنبيهات حالياً. عند نشر درس أو مقال أو كتاب جديد ستظهر هنا.</p>
              <Link to="/lectures" className="btn btn-outline" style={{ marginTop: '1rem', display: 'inline-block' }}>
                تابع الدورات
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Notifications;
