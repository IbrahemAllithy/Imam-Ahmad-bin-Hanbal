import { Router } from 'express';
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/testimonialController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { mongoIdParam } from '../middleware/validators.js';
import { uploadTestimonialPhoto, validateMagicBytes } from '../middleware/upload.js';

const router = Router();

router.get('/', getTestimonials);

router.use(protect, restrictTo('admin'));
router.post('/', uploadTestimonialPhoto, validateMagicBytes, createTestimonial);
router.put('/:id', mongoIdParam, uploadTestimonialPhoto, validateMagicBytes, updateTestimonial);
router.delete('/:id', mongoIdParam, deleteTestimonial);

export default router;
