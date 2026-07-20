import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  submitContact,
  getContacts,
  markContactRead,
  deleteContact,
} from '../controllers/contactController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { contactValidation, mongoIdParam } from '../middleware/validators.js';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'تجاوزت عدد الرسائل المسموح — حاول لاحقاً' },
});

router.post('/', contactLimiter, contactValidation, submitContact);

router.use(protect, restrictTo('admin'));
router.get('/', getContacts);
router.patch('/:id/read', mongoIdParam, markContactRead);
router.delete('/:id', mongoIdParam, deleteContact);

export default router;
