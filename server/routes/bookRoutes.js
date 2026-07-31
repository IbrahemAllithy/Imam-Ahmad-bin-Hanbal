import { Router } from 'express';
import {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} from '../controllers/bookController.js';
import { protect, restrictTo, optionalAuth } from '../middleware/auth.js';
import {
  bookValidation,
  mongoIdParam,
  listQueryValidation,
} from '../middleware/validators.js';
import { uploadBookFiles, validateMagicBytes, uploadFilesToR2 } from '../middleware/upload.js';

const router = Router();

router.get('/', optionalAuth, listQueryValidation, getBooks);
router.get('/:id', optionalAuth, mongoIdParam, getBook);

router.use(protect, restrictTo('admin'));
router.post('/', uploadBookFiles, validateMagicBytes, uploadFilesToR2, bookValidation, createBook);
router.put(
  '/:id',
  mongoIdParam,
  uploadBookFiles,
  validateMagicBytes,
  uploadFilesToR2,
  bookValidation,
  updateBook
);
router.delete('/:id', mongoIdParam, deleteBook);

export default router;
