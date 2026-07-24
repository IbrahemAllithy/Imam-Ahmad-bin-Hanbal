import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { globalSearch } from '../controllers/searchController.js';

const router = Router();

const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'تجاوزت عدد عمليات البحث المسموح — حاول بعد قليل',
    });
  },
});

router.get('/', searchLimiter, globalSearch);

export default router;
