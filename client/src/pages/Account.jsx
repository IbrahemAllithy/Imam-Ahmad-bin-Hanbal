import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useProgress from '../hooks/useProgress';
import api from '../services/api';
import { formatDate } from '../utils/helpers';
import './Auth.css';

const Account = () => {
  const { user, loading, logout, isStudent, isAdmin } = useAuth();
  const { completedIds, isLoggedIn } = useProgress();
  const [progressNote, setProgressNote] = useState('');

  useEffect(() => {
    if (!isLoggedIn) return;
    const count = completedIds?.size ?? 0;
    if (count > 0) {
      setProgressNote(`أكملت ${count} درساً حتى الآن`);
      return;
    }
    api
      .get('/progress')
      .then(({ data }) => {
        const n = data.completedIds?.length || data.data?.length || 0;
        if (n) setProgressNote(`أكملت ${n} درساً حتى الآن`);
      })
      .catch(() => {});
  }, [isLoggedIn, completedIds]);

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (!isStudent) {
    return <Navigate to="/login" replace />;
  }

  if (user.isEmailVerified === false) {
    return <Navigate to={`/verify-email?email=${encodeURIComponent(user.email)}`} replace />;
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>حسابي</h1>
          <p>مرحباً بك في حساب الطالب</p>
        </div>
      </div>

      <div className="container auth-page">
        <div className="account-card">
          <h2>{user.name}</h2>
          {progressNote && (
            <p style={{ color: 'var(--accent-color)', fontWeight: 600, margin: 0 }}>
              {progressNote}
            </p>
          )}
          <div className="account-fields">
            <div>
              <span>البريد الإلكتروني</span>
              <strong>{user.email}</strong>
            </div>
            {user.phone && (
              <div>
                <span>الهاتف</span>
                <strong>{user.phone}</strong>
              </div>
            )}
            {user.country && (
              <div>
                <span>الدولة</span>
                <strong>{user.country}</strong>
              </div>
            )}
            {user.createdAt && (
              <div>
                <span>تاريخ التسجيل</span>
                <strong>{formatDate(user.createdAt)}</strong>
              </div>
            )}
          </div>

          <div className="account-actions">
            <Link to="/start" className="btn btn-primary">
              ابدأ من هنا
            </Link>
            <Link to="/lectures" className="btn btn-outline">
              استعرض الدروس
            </Link>
            <Link to="/certificates" className="btn btn-outline">
              شهاداتي
            </Link>
            <Link to="/notifications" className="btn btn-outline">
              التنبيهات
            </Link>
            <button type="button" className="btn btn-outline" onClick={logout}>
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Account;
