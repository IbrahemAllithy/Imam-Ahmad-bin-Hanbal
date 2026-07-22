import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = sessionStorage.getItem('accessToken');
    const demoUser = sessionStorage.getItem('demo_admin_user');

    if (demoUser) {
      try {
        setUser(JSON.parse(demoUser));
      } catch {
        setUser({ name: 'مدير النظام', email: 'admin@example.com', role: 'admin' });
      }
      setLoading(false);
      return;
    }

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
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

  const login = async (email, password) => {
    // Demo admin bypass for immediate access
    if ((email === 'admin@example.com' || email === 'admin') && password === 'admin123') {
      const adminUser = { name: 'الشيخ شعبان العودة (مدير النظام)', email: 'admin@example.com', role: 'admin' };
      sessionStorage.setItem('demo_admin_user', JSON.stringify(adminUser));
      sessionStorage.setItem('accessToken', 'demo_access_token_123');
      setUser(adminUser);
      return { success: true, user: adminUser };
    }

    try {
      const { data } = await api.post('/auth/login', { email, password });
      sessionStorage.setItem('accessToken', data.accessToken);
      setUser(data.user);
      return data;
    } catch (err) {
      // Fallback for demo login if API fails or backend is offline
      if ((email === 'admin@example.com' || email === 'admin') && password === 'admin123') {
        const adminUser = { name: 'الشيخ شعبان العودة (مدير النظام)', email: 'admin@example.com', role: 'admin' };
        sessionStorage.setItem('demo_admin_user', JSON.stringify(adminUser));
        setUser(adminUser);
        return { success: true, user: adminUser };
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('demo_admin_user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: true }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
