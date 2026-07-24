import { Router } from 'express';
import {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../controllers/articleController.js';
import { protect, restrictTo, optionalAuth } from '../middleware/auth.js';
import {
  articleValidation,
  mongoIdParam,
  listQueryValidation,
} from '../middleware/validators.js';
import { uploadArticleCover, validateMagicBytes } from '../middleware/upload.js';

const router = Router();

router.get('/', optionalAuth, listQueryValidation, getArticles);
router.get('/:id', optionalAuth, mongoIdParam, getArticle);

router.use(protect, restrictTo('admin'));
router.post(
  '/',
  uploadArticleCover,
  validateMagicBytes,
  articleValidation,
  createArticle
);
router.put(
  '/:id',
  mongoIdParam,
  uploadArticleCover,
  validateMagicBytes,
  articleValidation,
  updateArticle
);
router.delete('/:id', mongoIdParam, deleteArticle);

export default router;
