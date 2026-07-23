import Lecture from '../models/Lecture.js';
import { extractYoutubeId } from '../utils/youtube.js';
import AppError from '../utils/AppError.js';
import { notifyAllStudents } from './notificationController.js';
import { publishedFilter, normalizePublishedAt } from '../utils/publish.js';

const buildFilter = (query, { includeUnpublished = false } = {}) => {
  const filter = includeUnpublished ? {} : { ...publishedFilter() };
  if (query.category) filter.category = query.category;
  if (query.series) filter.series = query.series;
  if (query.search) {
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { series: { $regex: query.search, $options: 'i' } },
      ],
    });
  }
  return filter;
};

const parseQuizItems = (body) => {
  if (body.quizItems === undefined) return undefined;
  let items = body.quizItems;
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      question: String(item.question || '').trim(),
      options: Array.isArray(item.options)
        ? item.options.map((o) => String(o).trim()).filter(Boolean)
        : [],
      correctIndex: Number(item.correctIndex) || 0,
    }))
    .filter((item) => item.question && item.options.length >= 2);
};

export const getLectures = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;
    const includeUnpublished = req.query.all === '1' && req.user?.role === 'admin';
    const filter = buildFilter(req.query, { includeUnpublished });

    const [lectures, total] = await Promise.all([
      Lecture.find(filter).sort({ order: 1, createdAt: 1 }).skip(skip).limit(limit),
      Lecture.countDocuments(filter),
    ]);

    const isAdmin = req.user?.role === 'admin';
    const data = isAdmin
      ? lectures
      : lectures.map((l) => {
          const obj = l.toObject();
          if (obj.quizItems?.length) {
            obj.quizItems = obj.quizItems.map(({ question, options }) => ({
              question,
              options,
            }));
          }
          return obj;
        });

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const getLecture = async (req, res, next) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return next(new AppError('المحاضرة غير موجودة', 404));

    const relatedFilter = {
      _id: { $ne: lecture._id },
      ...publishedFilter(),
    };
    if (lecture.series) {
      relatedFilter.series = lecture.series;
    } else {
      relatedFilter.category = lecture.category;
    }

    const related = await Lecture.find(relatedFilter)
      .sort({ order: 1, createdAt: 1 })
      .limit(50);

    // Hide correct answers from public; grade via dedicated endpoint or client for now
    // For fair MCQ we expose options only and grade on submit via POST /api/progress/quiz
    const payload = lecture.toObject();
    if (payload.quizItems?.length) {
      payload.quizItems = payload.quizItems.map(({ question, options }) => ({
        question,
        options,
      }));
    }

    res.json({ success: true, data: payload, related });
  } catch (err) {
    next(err);
  }
};

export const gradeLectureQuiz = async (req, res, next) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return next(new AppError('الدرس غير موجود', 404));

    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    const items = lecture.quizItems || [];
    if (!items.length) {
      return next(new AppError('لا يوجد اختبار متعدد الخيارات لهذا الدرس', 400));
    }

    let correct = 0;
    items.forEach((item, idx) => {
      if (Number(answers[idx]) === item.correctIndex) correct += 1;
    });

    const score = Math.round((correct / items.length) * 100);
    const passScore = 60;

    res.json({
      success: true,
      data: { score, correct, total: items.length, passed: score >= passScore, passScore },
    });
  } catch (err) {
    next(err);
  }
};

export const createLecture = async (req, res, next) => {
  try {
    const youtubeId = extractYoutubeId(req.body.youtubeUrl);
    if (!youtubeId) return next(new AppError('رابط اليوتيوب غير صالح', 400));

    const payload = { ...req.body, youtubeId };
    const quizItems = parseQuizItems(req.body);
    if (quizItems !== undefined) payload.quizItems = quizItems;
    if (payload.order !== undefined) payload.order = Number(payload.order) || 0;
    payload.publishedAt = normalizePublishedAt(payload.publishedAt);

    // Legacy quizQuestions from textarea lines
    if (typeof payload.quizQuestionsText === 'string') {
      payload.quizQuestions = payload.quizQuestionsText
        .split('\n')
        .map((q) => q.trim())
        .filter(Boolean);
      delete payload.quizQuestionsText;
    }

    const lecture = await Lecture.create(payload);

    notifyAllStudents({
      type: 'lecture',
      title: 'درس جديد متاح',
      body: `تمت إضافة درس: ${lecture.title}`,
      link: `/lectures/${lecture._id}`,
    });

    res.status(201).json({ success: true, data: lecture });
  } catch (err) {
    next(err);
  }
};

export const updateLecture = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.youtubeUrl) {
      const youtubeId = extractYoutubeId(updates.youtubeUrl);
      if (!youtubeId) return next(new AppError('رابط اليوتيوب غير صالح', 400));
      updates.youtubeId = youtubeId;
    }

    const quizItems = parseQuizItems(updates);
    if (quizItems !== undefined) updates.quizItems = quizItems;
    if (updates.order !== undefined) updates.order = Number(updates.order) || 0;
    if (updates.publishedAt !== undefined) {
      updates.publishedAt = normalizePublishedAt(updates.publishedAt);
    }
    if (typeof updates.quizQuestionsText === 'string') {
      updates.quizQuestions = updates.quizQuestionsText
        .split('\n')
        .map((q) => q.trim())
        .filter(Boolean);
      delete updates.quizQuestionsText;
    }

    const lecture = await Lecture.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!lecture) return next(new AppError('المحاضرة غير موجودة', 404));

    res.json({ success: true, data: lecture });
  } catch (err) {
    next(err);
  }
};

export const deleteLecture = async (req, res, next) => {
  try {
    const lecture = await Lecture.findByIdAndDelete(req.params.id);
    if (!lecture) return next(new AppError('المحاضرة غير موجودة', 404));
    res.json({ success: true, message: 'تم حذف المحاضرة' });
  } catch (err) {
    next(err);
  }
};

export const getSeries = async (_req, res, next) => {
  try {
    const series = await Lecture.distinct('series', {
      series: { $ne: '' },
      ...publishedFilter(),
    });
    res.json({ success: true, data: series });
  } catch (err) {
    next(err);
  }
};
