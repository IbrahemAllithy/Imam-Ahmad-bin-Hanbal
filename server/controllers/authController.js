import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';
const REFRESH_COOKIE = 'refreshToken';

const signAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });

const signRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      logger.security('محاولة دخول فاشلة — مستخدم غير موجود', { email });
      return next(new AppError('بيانات الدخول غير صحيحة', 401));
    }

    if (user.isLocked) {
      logger.security('محاولة دخول على حساب مقفل', { email });
      return next(new AppError('بيانات الدخول غير صحيحة', 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementFailedAttempts();
      logger.security('محاولة دخول فاشلة — كلمة مرور خاطئة', { email });
      return next(new AppError('بيانات الدخول غير صحيحة', 401));
    }

    await user.resetFailedAttempts();

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);

    res.json({
      success: true,
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (!token) return next(new AppError('انتهت الجلسة — يرجى تسجيل الدخول', 401));

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return next(new AppError('المستخدم غير موجود', 401));

    const accessToken = signAccessToken(user._id);
    res.json({ success: true, accessToken });
  } catch {
    res.clearCookie(REFRESH_COOKIE, cookieOptions);
    next(new AppError('انتهت الجلسة — يرجى تسجيل الدخول', 401));
  }
};

export const logout = (_req, res) => {
  res.clearCookie(REFRESH_COOKIE, cookieOptions);
  res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role },
  });
};
