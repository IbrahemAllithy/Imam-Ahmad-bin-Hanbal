import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
const PENDING_VERIFY_KEY = 'pending_email_verify_v1';

/** Clear legacy offline-auth keys that bypassed real JWT sessions */
const clearLegacyAuth = () => {
  try {
    sessionStorage.removeItem('demo_admin_user');
    sessionStorage.removeItem('student_session_v1');
    localStorage.removeItem('registered_students_v1');
    const token = sessionStorage.getItem('accessToken');
    if (token && (token.startsWith('demo_') || token.startsWith('local_'))) {
      sessionStorage.removeItem('accessToken');
    }
  } catch {
    // ignore
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    clearLegacyAuth();

    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      if (data.user?.role === 'student' && data.user?.isEmailVerified === false) {
        sessionStorage.removeItem('accessToken');
        setUser(null);
      } else {
        setUser(data.user);
      }
    } catch {
      sessionStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleAuthLogout = () => setUser(null);
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  const login = async (email, password, options = {}) => {
    const { requireAdmin = false } = options;
    const normalizedEmail = (email || '').trim().toLowerCase();

    try {
      const { data } = await api.post('/auth/login', {
        email: normalizedEmail,
        password,
      });

      if (requireAdmin && data.user?.role !== 'admin') {
        throw {
          response: { data: { message: 'هذا الحساب ليس حساب إدارة' } },
        };
      }

      sessionStorage.setItem('accessToken', data.accessToken);
      clearLegacyAuth();
      setUser(data.user);
      return data;
    } catch (err) {
      if (requireAdmin) {
        throw {
          response: {
            data: {
              message:
                err.response?.data?.message ||
                'تعذر دخول الأدمن. تأكد من تشغيل السيرفر وإنشاء الأدمن عبر: npm run seed:admin',
            },
          },
        };
      }
      throw err;
    }
  };

  const register = async ({ name, email, password, phone = '', country = '' }) => {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const payload = {
      name: (name || '').trim(),
      email: normalizedEmail,
      password,
      phone: (phone || '').trim(),
      country: (country || '').trim(),
    };

    const { data } = await api.post('/auth/register', payload);

    sessionStorage.removeItem('accessToken');
    clearLegacyAuth();
    setUser(null);

    if (data.requiresVerification) {
      sessionStorage.setItem(
        PENDING_VERIFY_KEY,
        JSON.stringify({
          email: data.email || normalizedEmail,
        })
      );
    }

    return { ...data, source: 'api' };
  };

  const verifyEmail = async ({ email, otp }) => {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const { data } = await api.post('/auth/verify-email', {
      email: normalizedEmail,
      otp: String(otp || '').trim(),
    });

    sessionStorage.setItem('accessToken', data.accessToken);
    sessionStorage.removeItem(PENDING_VERIFY_KEY);
    clearLegacyAuth();
    setUser(data.user);
    return data;
  };

  const resendOtp = async (email) => {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const { data } = await api.post('/auth/resend-otp', { email: normalizedEmail });
    sessionStorage.setItem(
      PENDING_VERIFY_KEY,
      JSON.stringify({ email: data.email || normalizedEmail })
    );
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      sessionStorage.removeItem('accessToken');
      clearLegacyAuth();
      setUser(null);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student' && Boolean(user?.isEmailVerified);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyEmail,
        resendOtp,
        logout,
        isAdmin,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export { PENDING_VERIFY_KEY };
