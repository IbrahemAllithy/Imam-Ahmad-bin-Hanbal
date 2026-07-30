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
  importPlaylist,
  reorderLessons,
  reorderSeries,
  uploadLecturePdfFile,
} from '../controllers/lectureController.js';
import { protect, restrictTo, optionalAuth } from '../middleware/auth.js';
import {
  lectureValidation,
  mongoIdParam,
  listQueryValidation,
  importPlaylistValidation,
  reorderLessonsValidation,
  reorderSeriesValidation,
} from '../middleware/validators.js';
import { uploadLecturePdf, validateMagicBytes, uploadFilesToR2 } from '../middleware/upload.js';

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
router.post('/import-playlist', importPlaylistValidation, importPlaylist);
router.post('/pdf', uploadLecturePdf, validateMagicBytes, uploadFilesToR2, uploadLecturePdfFile);
router.put('/reorder-lessons', reorderLessonsValidation, reorderLessons);
router.put('/reorder-series', reorderSeriesValidation, reorderSeries);
router.put('/:id', mongoIdParam, lectureValidation, updateLecture);
router.delete('/:id', mongoIdParam, deleteLecture);

export default router;
