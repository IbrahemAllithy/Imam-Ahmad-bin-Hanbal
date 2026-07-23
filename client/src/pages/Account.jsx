import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import './Auth.css';

const Account = () => {
  const { user, loading, logout, isStudent, isAdmin } = useAuth();

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
            <Link to="/lectures" className="btn btn-primary">
              استعرض الدروس
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
