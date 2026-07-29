import { Router } from 'express';
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/testimonialController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { mongoIdParam } from '../middleware/validators.js';
import { uploadTestimonialMedia, validateMagicBytes, uploadFilesToR2 } from '../middleware/upload.js';

const router = Router();

router.get('/', getTestimonials);

router.use(protect, restrictTo('admin'));
router.post('/', uploadTestimonialMedia, validateMagicBytes, uploadFilesToR2, createTestimonial);
router.put(
  '/:id',
  mongoIdParam,
  uploadTestimonialMedia,
  validateMagicBytes,
  uploadFilesToR2,
  updateTestimonial
);
router.delete('/:id', mongoIdParam, deleteTestimonial);

export default router;
