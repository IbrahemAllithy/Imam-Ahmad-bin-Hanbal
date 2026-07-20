import { Router } from 'express';
import {
  getLectures,
  getLecture,
  createLecture,
  updateLecture,
  deleteLecture,
  getSeries,
} from '../controllers/lectureController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import {
  lectureValidation,
  mongoIdParam,
  listQueryValidation,
} from '../middleware/validators.js';

const router = Router();

router.get('/', listQueryValidation, getLectures);
router.get('/series/list', getSeries);
router.get('/:id', mongoIdParam, getLecture);

router.use(protect, restrictTo('admin'));
router.post('/', lectureValidation, createLecture);
router.put('/:id', mongoIdParam, lectureValidation, updateLecture);
router.delete('/:id', mongoIdParam, deleteLecture);

export default router;
