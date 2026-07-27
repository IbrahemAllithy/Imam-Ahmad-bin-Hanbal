import { Router } from 'express';
import {
  getSaleBooks,
  createSaleBook,
  updateSaleBook,
  deleteSaleBook,
} from '../controllers/saleBooksController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { mongoIdParam } from '../middleware/validators.js';
import { uploadSaleBookCover, validateMagicBytes } from '../middleware/upload.js';

const router = Router();

router.get('/', getSaleBooks);

router.use(protect, restrictTo('admin'));
router.post('/', uploadSaleBookCover, validateMagicBytes, createSaleBook);
router.put('/:id', mongoIdParam, uploadSaleBookCover, validateMagicBytes, updateSaleBook);
router.delete('/:id', mongoIdParam, deleteSaleBook);

export default router;
