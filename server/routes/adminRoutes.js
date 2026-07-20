import { Router } from 'express';
import { getStats } from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

router.use(protect, restrictTo('admin'));
router.get('/stats', getStats);

export default router;
