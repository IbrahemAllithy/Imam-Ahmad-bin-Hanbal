import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateClientEmail } from '../utils/authValidation';
import './Auth.css';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/account';
  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'student' && user?.isEmailVerified !== false) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
  };

  const validate = () => {
    const next = {
      email: validateClientEmail(form.email),
      password: '',
    };
    if (!form.password) next.password = 'كلمة المرور مطلوبة';
    else if (form.password.length < 8) next.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    setFieldErrors(next);
    return !next.email && !next.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ email: '', password: '' });
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      if (result.user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      const message = err.response?.data?.message || 'بيانات الدخول غير صحيحة';
      const field = err.response?.data?.field;
      const needsVerify =
        err.response?.status === 403 ||
        err.response?.data?.requiresVerification ||
        message.includes('تفعيل');

      if (needsVerify) {
        navigate(`/verify-email?email=${encodeURIComponent(form.email.trim().toLowerCase())}`);
        return;
      }

      if (field === 'email' || field === 'password') {
        setFieldErrors((prev) => ({ ...prev, [field]: message }));
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>تسجيل الدخول</h1>
          <p>ادخل بحساب مفعّل عبر بريد حقيقي</p>
        </div>
      </div>

      <div className="container auth-page">
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">البريد الإلكتروني *</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="بريدك الحقيقي"
              className={fieldErrors.email ? 'input-error' : ''}
              aria-invalid={Boolean(fieldErrors.email)}
              autoComplete="email"
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">كلمة المرور *</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              className={fieldErrors.password ? 'input-error' : ''}
              aria-invalid={Boolean(fieldErrors.password)}
              autoComplete="current-password"
            />
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>

          <p className="auth-switch">
            <Link to="/forgot-password">نسيت كلمة المرور؟</Link>
          </p>

          <p className="auth-switch">
            ليس لديك حساب؟ <Link to="/register">سجّل حساباً جديداً</Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default Login;
