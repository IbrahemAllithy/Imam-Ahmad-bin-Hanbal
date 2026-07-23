import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, register, refresh, logout, getMe, verifyEmail, resendOtp } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  loginValidation,
  registerValidation,
  verifyEmailValidation,
  resendOtpValidation,
} from '../middleware/validators.js';
import logger from '../utils/logger.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
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

router.post('/register', registerLimiter, registerValidation, register);
router.post('/verify-email', otpLimiter, verifyEmailValidation, verifyEmail);
router.post('/resend-otp', otpLimiter, resendOtpValidation, resendOtp);
router.post('/login', loginLimiter, loginValidation, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;
