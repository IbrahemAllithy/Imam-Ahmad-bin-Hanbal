import LessonQuestion from '../models/LessonQuestion.js';
import Lecture from '../models/Lecture.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const askLessonQuestion = asyncHandler(async (req, res, next) => {
  const { lectureId, question } = req.body;
  if (!lectureId || !question?.trim()) {
    return next(new AppError('الدرس والسؤال مطلوبان', 400));
  }

  const lecture = await Lecture.findById(lectureId);
  if (!lecture) return next(new AppError('الدرس غير موجود', 404));

  const item = await LessonQuestion.create({
    user: req.user._id,
    lecture: lectureId,
    question: question.trim(),
  });

  res.status(201).json({ success: true, data: item });
});

export const getMyLessonQuestions = asyncHandler(async (req, res, next) => {
  const filter = { user: req.user._id };
  if (req.query.lectureId) filter.lecture = req.query.lectureId;

  const items = await LessonQuestion.find(filter)
    .populate('lecture', 'title series')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: items });
});

export const getAdminLessonQuestions = asyncHandler(async (req, res, next) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    LessonQuestion.find(filter)
      .populate('user', 'name email')
      .populate('lecture', 'title series')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    LessonQuestion.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const deleteLessonQuestion = asyncHandler(async (req, res, next) => {
  const item = await LessonQuestion.findByIdAndDelete(req.params.id);
  if (!item) return next(new AppError('السؤال غير موجود', 404));
  res.json({ success: true, message: 'تم حذف السؤال' });
});

export const replyLessonQuestion = asyncHandler(async (req, res, next) => {
  const { adminReply, status } = req.body;
  const item = await LessonQuestion.findById(req.params.id);
  if (!item) return next(new AppError('السؤال غير موجود', 404));

  if (adminReply !== undefined) item.adminReply = adminReply;
  if (status) item.status = status;
  else if (adminReply) item.status = 'answered';

  await item.save();
  res.json({ success: true, data: item });
});
