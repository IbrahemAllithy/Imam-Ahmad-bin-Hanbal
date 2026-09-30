import { protect, restrictTo } from '../../middleware/auth.js';

// إنشاء middleware للأدمن
const requireAdmin = restrictTo('admin');
import User from '../../models/User.js';
import { createTestUser, createTestAdmin, generateTestAccessToken } from '../helpers/testHelpers.js';
import jwt from 'jsonwebtoken';

// دوال مساعدة للاختبارات - نستخدم دوال بسيطة بدلاً من jest.fn()
const mockRequest = (data = {}) => ({
  body: data.body || {},
  params: data.params || {},
  query: data.query || {},
  user: data.user || null,
  cookies: data.cookies || {},
  headers: data.headers || {},
});

const mockResponse = () => {
  const res = {};
  const createMockFn = () => {
    const fn = function(...args) {
      fn.calls.push(args);
      return res;
    };
    fn.calls = [];
    return fn;
  };

  res.status = createMockFn();
  res.json = createMockFn();
  return res;
};

const mockNext = () => {
  const calls = [];
  const fn = function(...args) {
    calls.push(args);
  };
  fn.calls = calls;
  return fn;
};

describe('Auth Middleware', () => {
  describe('protect middleware', () => {
    it('يجب السماح بالوصول مع access token صحيح', async () => {
      const user = await createTestUser('student', { isEmailVerified: true });
      const token = generateTestAccessToken(user._id);

      const req = mockRequest({
        headers: { authorization: `Bearer ${token}` },
      });
      const res = mockResponse();

      return new Promise((resolve, reject) => {
        const next = (error) => {
          if (error) {
            reject(error);
          } else {
            try {
              // التحقق من أن المستخدم تم إضافته إلى req
              expect(req.user).toBeDefined();
              expect(req.user._id.toString()).toBe(user._id.toString());
              expect(req.user.email).toBe(user.email);
              resolve();
            } catch (err) {
              reject(err);
            }
          }
        };

        // استدعاء protect
        protect(req, res, next);
      });
    });

    it('يجب رفض الوصول بدون authorization header', async () => {
      const req = mockRequest({});
      const res = mockResponse();
      const next = mockNext();

      await protect(req, res, next);

      expect(next.calls.length).toBe(1);
      const error = next.calls[0][0];
      expect(error).toBeDefined();
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain('تسجيل الدخول');
    });

    it('يجب رفض الوصول مع token غير صحيح', async () => {
      const req = mockRequest({
        headers: { authorization: 'Bearer invalid-token' },
      });
      const res = mockResponse();
      const next = mockNext();

      await protect(req, res, next);

      expect(next.calls.length).toBe(1);
      const error = next.calls[0][0];
      expect(error).toBeDefined();
      expect(error.statusCode).toBe(401);
    });

    it('يجب رفض الوصول مع token منتهي الصلاحية', async () => {
      const user = await createTestUser('student', { isEmailVerified: true });
      const expiredToken = jwt.sign(
        { id: user._id },
        process.env.JWT_ACCESS_SECRET || 'test-secret',
        { expiresIn: '0s' }
      );

      const req = mockRequest({
        headers: { authorization: `Bearer ${expiredToken}` },
      });
      const res = mockResponse();
      const next = mockNext();

      // انتظار ثانية واحدة لضمان انتهاء صلاحية التوكن
      await new Promise(resolve => setTimeout(resolve, 1000));

      await protect(req, res, next);

      expect(next.calls.length).toBe(1);
      const error = next.calls[0][0];
      expect(error).toBeDefined();
      expect(error.statusCode).toBe(401);
    });

    it('يجب رفض الوصول إذا لم يعد المستخدم موجوداً', async () => {
      const user = await createTestUser('student', { isEmailVerified: true });
      const token = generateTestAccessToken(user._id);

      // حذف المستخدم
      await User.findByIdAndDelete(user._id);

      const req = mockRequest({
        headers: { authorization: `Bearer ${token}` },
      });
      const res = mockResponse();

      return new Promise((resolve, reject) => {
        const next = (error) => {
          try {
            // التحقق من أن next تم استدعاؤه مع خطأ
            expect(error).toBeDefined();
            expect(error.statusCode).toBe(401);
            expect(error.message).toContain('موجود');
            resolve();
          } catch (err) {
            reject(err);
          }
        };

        // استدعاء protect
        protect(req, res, next);
      });
    });
  });

  describe('requireAdmin middleware', () => {
    it('يجب السماح بالوصول للأدمن', () => {
      const req = mockRequest({
        user: { _id: '123', role: 'admin' },
      });
      const res = mockResponse();
      const next = mockNext();

      requireAdmin(req, res, next);

      expect(next.calls.length).toBe(1);
      expect(next.calls[0]).toEqual([]);
    });

    it('يجب رفض الوصول للطالب العادي', () => {
      const req = mockRequest({
        user: { _id: '123', role: 'student' },
      });
      const res = mockResponse();
      const next = mockNext();

      requireAdmin(req, res, next);

      expect(next.calls.length).toBe(1);
      const error = next.calls[0][0];
      expect(error).toBeDefined();
      expect(error.statusCode).toBe(403);
      expect(error.message).toContain('صلاحية');
    });

    it('يجب رفض الوصول بدون user في request', () => {
      const req = mockRequest({});
      const res = mockResponse();
      const next = mockNext();

      requireAdmin(req, res, next);

      expect(next.calls.length).toBe(1);
      const error = next.calls[0][0];
      expect(error).toBeDefined();
      expect(error.statusCode).toBe(403);
    });
  });
});
