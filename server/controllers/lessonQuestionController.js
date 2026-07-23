import LessonQuestion from '../models/LessonQuestion.js';
import Lecture from '../models/Lecture.js';
import AppError from '../utils/AppError.js';

export const askLessonQuestion = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

export const getMyLessonQuestions = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.lectureId) filter.lecture = req.query.lectureId;

    const items = await LessonQuestion.find(filter)
      .populate('lecture', 'title series')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

export const getAdminLessonQuestions = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const items = await LessonQuestion.find(filter)
      .populate('user', 'name email')
      .populate('lecture', 'title series')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

export const replyLessonQuestion = async (req, res, next) => {
  try {
    const { adminReply, status } = req.body;
    const item = await LessonQuestion.findById(req.params.id);
    if (!item) return next(new AppError('السؤال غير موجود', 404));

    if (adminReply !== undefined) item.adminReply = adminReply;
    if (status) item.status = status;
    else if (adminReply) item.status = 'answered';

    await item.save();
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};
