import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateClientEmail, validateClientName } from '../utils/authValidation';
import './Auth.css';

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'student' && user?.isEmailVerified !== false) {
      navigate('/account', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
  };

  const validate = () => {
    const next = {
      name: validateClientName(form.name),
      email: validateClientEmail(form.email),
      password: '',
      confirmPassword: '',
    };

    if (!form.password) next.password = 'كلمة المرور مطلوبة';
    else if (form.password.length < 8) next.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';

    if (form.password !== form.confirmPassword) {
      next.confirmPassword = 'كلمتا المرور غير متطابقتين';
    }

    setFieldErrors(next);
    return !Object.values(next).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        country: form.country,
      });

      if (result.requiresVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(result.email || form.email)}`, {
          replace: true,
        });
        return;
      }

      navigate('/account', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'تعذر إنشاء الحساب — حاول مجدداً';
      const field = err.response?.data?.field;
      if (field) {
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
          <h1>تسجيل حساب طالب</h1>
          <p>أنشئ حسابك ببريد حقيقي ثم فعّله برمز التأكيد</p>
        </div>
      </div>

      <div className="container auth-page">
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">الاسم الكامل *</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              maxLength={100}
              placeholder="مثال: أحمد محمد"
              className={fieldErrors.name ? 'input-error' : ''}
            />
            {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">البريد الإلكتروني الحقيقي *</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="بريدك الشخصي مثل name@gmail.com"
              className={fieldErrors.email ? 'input-error' : ''}
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>

          <div className="auth-form-row">
            <div className="form-group">
              <label htmlFor="phone">رقم الهاتف</label>
              <input id="phone" name="phone" value={form.phone} onChange={handleChange} maxLength={30} placeholder="اختياري" />
            </div>
            <div className="form-group">
              <label htmlFor="country">الدولة</label>
              <input id="country" name="country" value={form.country} onChange={handleChange} maxLength={80} placeholder="اختياري" />
            </div>
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
              placeholder="8 أحرف على الأقل"
              className={fieldErrors.password ? 'input-error' : ''}
            />
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">تأكيد كلمة المرور *</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              minLength={8}
              className={fieldErrors.confirmPassword ? 'input-error' : ''}
            />
            {fieldErrors.confirmPassword && (
              <span className="field-error">{fieldErrors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'جاري الإرسال...' : 'متابعة لتفعيل البريد'}
          </button>

          <p className="auth-switch">
            لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default Register;
