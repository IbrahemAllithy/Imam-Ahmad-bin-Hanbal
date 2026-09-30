import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, _res, next) => {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('غير مصرح — يرجى تسجيل الدخول', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new AppError('المستخدم غير موجود', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    // تمييز أنواع أخطاء JWT للمساعدة في debugging
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('انتهت صلاحية الجلسة — يرجى تسجيل الدخول مجدداً', 401));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('رمز المصادقة غير صالح', 401));
    }
    // أخطاء أخرى غير متوقعة
    throw new AppError('خطأ في التحقق من الهوية', 401);
  }
});

/** Attach user if token present; never fail the request */
export const optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return next();
    const token = authHeader.split(' ')[1];
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user) req.user = user;
  } catch {
    // ignore
  }
  next();
};

export const restrictTo = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('ليس لديك صلاحية للوصول', 403));
  }
  next();
};
