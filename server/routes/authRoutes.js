import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  login,
  register,
  refresh,
  logout,
  getMe,
  verifyEmail,
  resendOtp,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  loginValidation,
  registerValidation,
  verifyEmailValidation,
  resendOtpValidation,
} from '../middleware/validators.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validators.js';
import logger from '../utils/logger.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.security('تجاوز حد محاولات تسجيل الدخول', { ip: req.ip });
    res.status(429).json({
      success: false,
      message: 'تجاوزت عدد محاولات تسجيل الدخول — حاول بعد 15 دقيقة',
    });
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.security('تجاوز حد تسجيل الحسابات', { ip: req.ip });
    res.status(429).json({
      success: false,
      message: 'تجاوزت عدد محاولات التسجيل — حاول لاحقاً',
    });
  },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.security('تجاوز حد محاولات رمز التفعيل', { ip: req.ip });
    res.status(429).json({
      success: false,
      message: 'تجاوزت عدد محاولات التفعيل — حاول بعد قليل',
    });
  },
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 30 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'تجاوزت عدد محاولات تحديث الجلسة — حاول لاحقاً',
    });
  },
});

const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'تجاوزت عدد محاولات استعادة كلمة المرور — حاول لاحقاً',
    });
  },
});

const forgotValidation = [
  body('email').trim().isEmail().withMessage('صيغة البريد الإلكتروني غير صحيحة'),
  validate,
];

const resetValidation = [
  body('token').trim().notEmpty().withMessage('رمز إعادة التعيين مطلوب'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .isLength({ max: 128 })
    .withMessage('كلمة المرور طويلة جداً'),
  validate,
];

router.post('/register', registerLimiter, registerValidation, register);
router.post('/verify-email', otpLimiter, verifyEmailValidation, verifyEmail);
router.post('/resend-otp', otpLimiter, resendOtpValidation, resendOtp);
router.post('/login', loginLimiter, loginValidation, login);
router.post('/forgot-password', resetLimiter, forgotValidation, forgotPassword);
router.post('/reset-password', resetLimiter, resetValidation, resetPassword);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;
