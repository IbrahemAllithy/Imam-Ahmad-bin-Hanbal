import { Router } from 'express';
import {
  getSettings,
  updateSettings,
  resetSettings,
} from '../controllers/settingsController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { uploadBrandingImages, validateMagicBytes } from '../middleware/upload.js';

const router = Router();

router.get('/', getSettings);

router.use(protect, restrictTo('admin'));
router.put('/', uploadBrandingImages, validateMagicBytes, updateSettings);
router.post('/reset', resetSettings);

export default router;
