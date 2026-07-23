import { Router } from 'express';
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  sendAdminBroadcast,
} from '../controllers/notificationController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { mongoIdParam } from '../middleware/validators.js';

const router = Router();

// Student / Admin routes
router.use(protect);

router.get('/', getMyNotifications);
router.patch('/read-all', markAllNotificationsRead);
router.patch('/:id/read', mongoIdParam, markNotificationRead);

// Admin-only broadcast route
router.post('/broadcast', restrictTo('admin'), sendAdminBroadcast);

export default router;
