import User from '../../models/User.js';
import jwt from 'jsonwebtoken';

// إنشاء مستخدم تجريبي
export const createTestUser = async (role = 'student', customData = {}) => {
  const userData = {
    name: customData.name || 'Test User',
    email: customData.email || `test${Date.now()}@example.com`,
    password: customData.password || 'Password123',
    role,
    isEmailVerified: customData.isEmailVerified !== undefined ? customData.isEmailVerified : true,
    ...customData,
  };

  const user = await User.create(userData);

  // إذا تم تمرير كلمة مرور، نحتاج إرجاع المستخدم بعد التجزئة
  // لكن نحفظ كلمة المرور الأصلية في خاصية إضافية للاختبارات
  user.plainPassword = customData.password || 'Password123';

  return user;
};

// إنشاء admin تجريبي
export const createTestAdmin = async (customData = {}) => {
  return createTestUser('admin', customData);
};

// إنشاء access token تجريبي
export const generateTestAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET || 'test-secret', {
    expiresIn: '15m',
  });
};

// إنشاء refresh token تجريبي
export const generateTestRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || 'test-refresh-secret', {
    expiresIn: '7d',
  });
};

// محاكاة req/res/next للاختبارات
export const mockRequest = (data = {}) => {
  return {
    body: data.body || {},
    params: data.params || {},
    query: data.query || {},
    user: data.user || null,
    cookies: data.cookies || {},
    file: data.file || null,
    files: data.files || null,
    headers: data.headers || {},
  };
};

export const mockResponse = () => {
  const res = {};
  const mockFn = (returnValue) => {
    const fn = (...args) => {
      fn.mock.calls.push(args);
      return returnValue;
    };
    fn.mock = { calls: [] };
    return fn;
  };

  res.status = mockFn(res);
  res.json = mockFn(res);
  res.cookie = mockFn(res);
  res.clearCookie = mockFn(res);
  return res;
};

export const mockNext = () => {
  const fn = (...args) => {
    fn.mock.calls.push(args);
  };
  fn.mock = { calls: [] };
  return fn;
};
