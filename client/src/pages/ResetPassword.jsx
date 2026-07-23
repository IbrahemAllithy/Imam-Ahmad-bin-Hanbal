import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const next = { password: '', confirm: '' };
    if (!token) {
      setError('رابط إعادة التعيين غير صالح');
      return;
    }
    if (password.length < 8) next.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    if (password !== confirm) next.confirm = 'كلمتا المرور غير متطابقتين';
    setFieldErrors(next);
    if (next.password || next.confirm) return;

    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', { token, password });
      setSuccess(data.message || 'تم تحديث كلمة المرور');
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'تعذر تحديث كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>تعيين كلمة مرور جديدة</h1>
          <p>أدخل كلمة مرور قوية ثم سجّل الدخول</p>
        </div>
      </div>

      <div className="container auth-page">
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="form-group">
            <label htmlFor="password">كلمة المرور الجديدة *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldErrors.password ? 'input-error' : ''}
                aria-invalid={Boolean(fieldErrors.password)}
                autoComplete="new-password"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? 'إخفاء' : 'إظهار'}
              </button>
            </div>
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirm">تأكيد كلمة المرور *</label>
            <input
              id="confirm"
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={fieldErrors.confirm ? 'input-error' : ''}
              aria-invalid={Boolean(fieldErrors.confirm)}
              autoComplete="new-password"
            />
            {fieldErrors.confirm && <span className="field-error">{fieldErrors.confirm}</span>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || !token}>
            {loading ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
          </button>

          <p className="auth-switch">
            <Link to="/login">العودة لتسجيل الدخول</Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default ResetPassword;
