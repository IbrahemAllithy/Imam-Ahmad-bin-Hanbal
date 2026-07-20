import Lecture from '../models/Lecture.js';
import { extractYoutubeId } from '../utils/youtube.js';
import AppError from '../utils/AppError.js';

const buildFilter = (query) => {
  const filter = {};
  if (query.category) filter.category = query.category;
  if (query.series) filter.series = query.series;
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
      { series: { $regex: query.search, $options: 'i' } },
    ];
  }
  return filter;
};

export const getLectures = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;
    const filter = buildFilter(req.query);

    const [lectures, total] = await Promise.all([
      Lecture.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Lecture.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: lectures,
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

    const related = await Lecture.find({
      _id: { $ne: lecture._id },
      category: lecture.category,
    })
      .sort({ createdAt: -1 })
      .limit(4);

    res.json({ success: true, data: lecture, related });
  } catch (err) {
    next(err);
  }
};

export const createLecture = async (req, res, next) => {
  try {
    const youtubeId = extractYoutubeId(req.body.youtubeUrl);
    if (!youtubeId) return next(new AppError('رابط اليوتيوب غير صالح', 400));

    const lecture = await Lecture.create({ ...req.body, youtubeId });
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
    const series = await Lecture.distinct('series', { series: { $ne: '' } });
    res.json({ success: true, data: series });
  } catch (err) {
    next(err);
  }
};
