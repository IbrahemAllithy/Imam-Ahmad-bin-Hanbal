import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { validateClientEmail } from '../utils/authValidation';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const emailErr = validateClientEmail(email);
    if (emailErr) {
      setFieldError(emailErr);
      return;
    }
    setFieldError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });
      setSuccess(data.message || 'إن وُجد حساب بهذا البريد فستصلك رسالة لإعادة التعيين.');
    } catch (err) {
      setError(err.response?.data?.message || 'تعذر إرسال الطلب — حاول لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>نسيت كلمة المرور</h1>
          <p>أدخل بريدك وسنرسل رابط إعادة التعيين إن وُجد حساب مرتبط به</p>
        </div>
      </div>

      <div className="container auth-page">
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="form-group">
            <label htmlFor="email">البريد الإلكتروني *</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldError('');
              }}
              className={fieldError ? 'input-error' : ''}
              aria-invalid={Boolean(fieldError)}
              autoComplete="email"
            />
            {fieldError && <span className="field-error">{fieldError}</span>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
          </button>

          <p className="auth-switch">
            تذكرت كلمة المرور؟ <Link to="/login">العودة لتسجيل الدخول</Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default ForgotPassword;
