import { Router } from 'express';
import {
  getMyProgress,
  markComplete,
  unmarkComplete,
  syncLocalProgress,
  gradeQuiz,
} from '../controllers/progressController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { mongoIdParam } from '../middleware/validators.js';

const router = Router();

router.use(protect, restrictTo('student', 'admin'));

router.get('/', getMyProgress);
router.post('/', markComplete);
router.post('/sync', syncLocalProgress);
router.post('/quiz', gradeQuiz);
router.delete('/:id', mongoIdParam, unmarkComplete);

export default router;
