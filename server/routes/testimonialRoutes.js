import { Router } from 'express';
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
} from '../controllers/testimonialController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { mongoIdParam, reorderTestimonialsValidation } from '../middleware/validators.js';
import { uploadTestimonialMedia, validateMagicBytes, uploadFilesToR2 } from '../middleware/upload.js';

const router = Router();

router.get('/', getTestimonials);

router.use(protect, restrictTo('admin'));
router.post('/', uploadTestimonialMedia, validateMagicBytes, uploadFilesToR2, createTestimonial);
// Must precede '/:id', otherwise "reorder" is read as an id and fails validation.
router.put('/reorder', reorderTestimonialsValidation, reorderTestimonials);
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
