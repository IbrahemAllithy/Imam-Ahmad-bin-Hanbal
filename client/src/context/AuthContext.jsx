import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
const LOCAL_STUDENTS_KEY = 'registered_students_v1';
const LOCAL_SESSION_KEY = 'student_session_v1';
const PENDING_VERIFY_KEY = 'pending_email_verify_v1';

const readLocalStudents = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STUDENTS_KEY) || '[]');
  } catch {
    return [];
  }
};

const writeLocalStudents = (students) => {
  localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(students));
};

const toPublicUser = (user) => ({
  id: user.id || user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  country: user.country || '',
  role: user.role || 'student',
  isEmailVerified: Boolean(user.isEmailVerified),
  createdAt: user.createdAt,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const demoUser = sessionStorage.getItem('demo_admin_user');
    if (demoUser) {
      try {
        setUser(JSON.parse(demoUser));
      } catch {
        setUser({ name: 'مدير النظام', email: 'admin@example.com', role: 'admin', isEmailVerified: true });
      }
      setLoading(false);
      return;
    }

    const localSession = sessionStorage.getItem(LOCAL_SESSION_KEY);
    if (localSession) {
      try {
        const parsed = JSON.parse(localSession);
        if (parsed.role === 'student' && !parsed.isEmailVerified) {
          sessionStorage.removeItem(LOCAL_SESSION_KEY);
          sessionStorage.removeItem('accessToken');
        } else {
          setUser(parsed);
          setLoading(false);
          return;
        }
      } catch {
        sessionStorage.removeItem(LOCAL_SESSION_KEY);
      }
    }

    const token = sessionStorage.getItem('accessToken');
    if (!token || token.startsWith('demo_') || token.startsWith('local_')) {
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

  const login = async (email, password, options = {}) => {
    const { requireAdmin = false } = options;
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (
      requireAdmin &&
      (normalizedEmail === 'admin@example.com' || normalizedEmail === 'admin') &&
      password === 'admin123'
    ) {
      const adminUser = {
        name: 'الشيخ شعبان العودة (مدير النظام)',
        email: 'admin@example.com',
        role: 'admin',
        isEmailVerified: true,
      };
      sessionStorage.setItem('demo_admin_user', JSON.stringify(adminUser));
      sessionStorage.setItem('accessToken', 'demo_access_token_123');
      sessionStorage.removeItem(LOCAL_SESSION_KEY);
      setUser(adminUser);
      return { success: true, user: adminUser };
    }

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
      sessionStorage.removeItem('demo_admin_user');
      sessionStorage.removeItem(LOCAL_SESSION_KEY);
      setUser(data.user);
      return data;
    } catch (err) {
      if (
        requireAdmin &&
        (normalizedEmail === 'admin@example.com' || normalizedEmail === 'admin') &&
        password === 'admin123'
      ) {
        const adminUser = {
          name: 'الشيخ شعبان العودة (مدير النظام)',
          email: 'admin@example.com',
          role: 'admin',
          isEmailVerified: true,
        };
        sessionStorage.setItem('demo_admin_user', JSON.stringify(adminUser));
        sessionStorage.setItem('accessToken', 'demo_access_token_123');
        setUser(adminUser);
        return { success: true, user: adminUser };
      }

      // Preserve API verification / validation errors
      if (err.response?.data?.field || err.response?.status === 403) {
        throw err;
      }

      if (!requireAdmin) {
        const localStudents = readLocalStudents();
        const emailExists = localStudents.find((s) => s.email === normalizedEmail);
        if (emailExists) {
          if (!emailExists.isEmailVerified) {
            throw {
              response: {
                data: {
                  message: 'يجب تفعيل البريد الإلكتروني أولاً عبر رمز التأكيد',
                  field: 'email',
                  requiresVerification: true,
                  email: normalizedEmail,
                },
              },
            };
          }
          if (emailExists.password === password) {
            const publicUser = toPublicUser({ ...emailExists, role: 'student' });
            sessionStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(publicUser));
            sessionStorage.setItem('accessToken', `local_${emailExists.id}`);
            sessionStorage.removeItem('demo_admin_user');
            setUser(publicUser);
            return { success: true, user: publicUser, source: 'local' };
          }
          throw {
            response: {
              data: { message: 'كلمة المرور غير صحيحة', field: 'password' },
            },
          };
        }

        if (!err.response || err.response.status >= 500) {
          throw {
            response: {
              data: {
                message: 'هذا البريد الإلكتروني غير مسجّل في الموقع',
                field: 'email',
              },
            },
          };
        }
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

    // Never auto-login before email verification
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem(LOCAL_SESSION_KEY);
    sessionStorage.removeItem('demo_admin_user');
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
    sessionStorage.removeItem('demo_admin_user');
    sessionStorage.removeItem(LOCAL_SESSION_KEY);
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
      sessionStorage.removeItem('demo_admin_user');
      sessionStorage.removeItem(LOCAL_SESSION_KEY);
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

export { LOCAL_STUDENTS_KEY, PENDING_VERIFY_KEY };
