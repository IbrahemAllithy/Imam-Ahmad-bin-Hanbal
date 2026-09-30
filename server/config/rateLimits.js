import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

/**
 * Rate limiters مخصصة لكل نوع endpoint
 */

// Global limiter - جميع الـ API calls
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 300, // 300 طلب
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.security('تجاوز الحد العام للطلبات', { ip: req.ip, url: req.originalUrl });
    res.status(429).json({
      success: false,
      message: 'تجاوزت عدد الطلبات المسموح — حاول بعد 15 دقيقة',
    });
  },
});

// Auth limiter - تسجيل الدخول والتسجيل
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 محاولات فقط
  skipSuccessfulRequests: true, // لا نحسب المحاولات الناجحة
  handler: (req, res) => {
    logger.security('تجاوز حد محاولات تسجيل الدخول', {
      ip: req.ip,
      email: req.body.email,
    });
    res.status(429).json({
      success: false,
      message: 'محاولات كثيرة — حاول بعد 15 دقيقة',
    });
  },
});

// Upload limiter - رفع الملفات
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة
  max: 20, // 20 رفع ملف في الساعة
  handler: (req, res) => {
    logger.security('تجاوز حد رفع الملفات', { ip: req.ip, userId: req.user?._id });
    res.status(429).json({
      success: false,
      message: 'تجاوزت عدد عمليات رفع الملفات — حاول بعد ساعة',
    });
  },
});

// Contact form limiter
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة
  max: 5, // 5 رسائل في الساعة
  handler: (req, res) => {
    logger.security('تجاوز حد نموذج التواصل', { ip: req.ip });
    res.status(429).json({
      success: false,
      message: 'تجاوزت عدد الرسائل المسموح — حاول بعد ساعة',
    });
  },
});

// Password reset limiter
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3, // 3 محاولات في الساعة
  handler: (req, res) => {
    logger.security('تجاوز حد طلبات إعادة تعيين كلمة المرور', {
      ip: req.ip,
      email: req.body.email,
    });
    res.status(429).json({
      success: false,
      message: 'تجاوزت عدد المحاولات — حاول بعد ساعة',
    });
  },
});

// Admin operations limiter
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // حد أعلى للأدمن
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.security('تجاوز حد عمليات الأدمن', {
      ip: req.ip,
      userId: req.user?._id,
      url: req.originalUrl,
    });
    res.status(429).json({
      success: false,
      message: 'تجاوزت عدد الطلبات المسموح',
    });
  },
});
