import { Router } from 'express';
import {
  askLessonQuestion,
  getMyLessonQuestions,
  getAdminLessonQuestions,
  replyLessonQuestion,
} from '../controllers/lessonQuestionController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { mongoIdParam } from '../middleware/validators.js';

const router = Router();

router.use(protect);

router.post('/', restrictTo('student', 'admin'), askLessonQuestion);
router.get('/mine', restrictTo('student', 'admin'), getMyLessonQuestions);

router.get('/admin', restrictTo('admin'), getAdminLessonQuestions);
router.patch('/admin/:id', restrictTo('admin'), mongoIdParam, replyLessonQuestion);

export default router;
