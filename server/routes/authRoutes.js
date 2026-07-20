import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, refresh, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { loginValidation } from '../middleware/validators.js';
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

router.post('/login', loginLimiter, loginValidation, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, getMe);

export default router;
