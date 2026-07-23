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
import { uploadBookFiles, validateMagicBytes } from '../middleware/upload.js';

const router = Router();

router.get('/', optionalAuth, listQueryValidation, getBooks);
router.get('/:id', mongoIdParam, getBook);

router.use(protect, restrictTo('admin'));
router.post('/', uploadBookFiles, validateMagicBytes, bookValidation, createBook);
router.put('/:id', mongoIdParam, uploadBookFiles, validateMagicBytes, bookValidation, updateBook);
router.delete('/:id', mongoIdParam, deleteBook);

export default router;
