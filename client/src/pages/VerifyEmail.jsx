import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, PENDING_VERIFY_KEY } from '../context/AuthContext';
import './Auth.css';

const VerifyEmail = () => {
  const { verifyEmail, resendOtp, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get('email') || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (user?.role === 'student' && user?.isEmailVerified !== false) {
      navigate('/account', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    try {
      const pending = JSON.parse(sessionStorage.getItem(PENDING_VERIFY_KEY) || 'null');
      if (pending?.email && !email) setEmail(pending.email);
    } catch {
      // ignore
    }
  }, [email]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.trim() || !otp.trim()) {
      setError('أدخل البريد ورمز التفعيل');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail({ email, otp });
      setSuccess('تم تفعيل الحساب بنجاح');
      setTimeout(() => navigate('/account', { replace: true }), 500);
    } catch (err) {
      setError(err.response?.data?.message || 'تعذر التفعيل — تحقق من الرمز المرسل لبريدك');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    if (!email.trim()) {
      setError('أدخل البريد الإلكتروني أولاً');
      return;
    }
    setResending(true);
    try {
      const data = await resendOtp(email);
      setSuccess(data.message || 'تم إرسال رمز جديد إلى بريدك');
    } catch (err) {
      setError(err.response?.data?.message || 'تعذر إرسال الرمز إلى البريد');
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>تفعيل البريد الإلكتروني</h1>
          <p>افتح بريدك الإلكتروني وانسخ رمز التفعيل المرسل إليك</p>
        </div>
      </div>

      <div className="container auth-page">
        <form onSubmit={handleVerify} className="auth-form" noValidate>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="alert alert-success">
            تم إرسال الرمز إلى بريدك فقط. لن يظهر الرمز داخل الموقع لأسباب أمنية.
          </div>

          <div className="form-group">
            <label htmlFor="email">البريد الإلكتروني</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="otp">رمز التفعيل المرسل إلى بريدك</label>
            <input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
              placeholder="******"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'جاري التفعيل...' : 'تفعيل الحساب'}
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز إلى البريد'}
          </button>

          <p className="auth-switch">
            <Link to="/login">العودة لتسجيل الدخول</Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default VerifyEmail;
