import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getLectures,
  getLecture,
  createLecture,
  updateLecture,
  deleteLecture,
  getSeries,
  getCourses,
  gradeLectureQuiz,
} from '../controllers/lectureController.js';
import { protect, restrictTo, optionalAuth } from '../middleware/auth.js';
import {
  lectureValidation,
  mongoIdParam,
  listQueryValidation,
} from '../middleware/validators.js';

const router = Router();

const quizLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 40 : 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'تجاوزت عدد محاولات الاختبار — حاول لاحقاً',
    });
  },
});

router.get('/', optionalAuth, listQueryValidation, getLectures);
router.get('/courses', getCourses);
router.get('/series/list', getSeries);
router.get('/:id', optionalAuth, mongoIdParam, getLecture);
router.post(
  '/:id/quiz',
  quizLimiter,
  protect,
  restrictTo('student', 'admin'),
  mongoIdParam,
  gradeLectureQuiz
);

router.use(protect, restrictTo('admin'));
router.post('/', lectureValidation, createLecture);
router.put('/:id', mongoIdParam, lectureValidation, updateLecture);
router.delete('/:id', mongoIdParam, deleteLecture);

export default router;
