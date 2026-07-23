import { Router } from 'express';
import { getMyCertificates, getCertificate } from '../controllers/certificateController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { mongoIdParam } from '../middleware/validators.js';

const router = Router();

router.use(protect, restrictTo('student', 'admin'));
router.get('/', getMyCertificates);
router.get('/:id', mongoIdParam, getCertificate);

export default router;
