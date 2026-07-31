import Lecture from '../models/Lecture.js';
import { extractYoutubeId } from '../utils/youtube.js';
import AppError from '../utils/AppError.js';
import { notifyAllStudents } from './notificationController.js';
import { publishedFilter, normalizePublishedAt } from '../utils/publish.js';
import { escapeRegex } from '../utils/sanitize.js';
import { extractPlaylistId, fetchPlaylistVideos } from '../utils/youtubePlaylist.js';
import { removeUploadedFiles } from '../middleware/upload.js';

const truncate = (s, max = 200) => {
  const t = String(s || '').trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
};

const buildFilter = (query, { includeUnpublished = false } = {}) => {
  const filter = includeUnpublished ? {} : { ...publishedFilter() };
  if (query.category) filter.category = query.category;
  if (query.series) filter.series = query.series;
  if (query.search) {
    const search = escapeRegex(String(query.search).slice(0, 100));
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { series: { $regex: search, $options: 'i' } },
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
      Lecture.find(filter).sort({ order: 1, createdAt: 1 }).skip(skip).limit(limit).lean(),
      Lecture.countDocuments(filter),
    ]);

    const isAdmin = req.user?.role === 'admin';
    const data = isAdmin
      ? lectures
      : lectures.map((obj) => {
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
    const isAdmin = req.user?.role === 'admin';
    const filter = isAdmin ? { _id: req.params.id } : { _id: req.params.id, ...publishedFilter() };
    const lecture = await Lecture.findOne(filter).lean();
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
      .limit(50)
      .lean();

    // Hide correct answers from public; grade via dedicated endpoint or client for now
    // For fair MCQ we expose options only and grade on submit via POST /api/progress/quiz
    const payload = lecture;
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
    const lecture = await Lecture.findById(req.params.id).lean();
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

/**
 * Uploads a book PDF and returns its public URL for the lesson's `pdfUrl` field. A series is
 * one book, so passing `series` stamps that URL onto every lesson of it in one go — otherwise
 * the same file would have to be re-uploaded per lesson, leaving duplicate copies in storage.
 */
export const uploadLecturePdfFile = async (req, res, next) => {
  try {
    if (!req.file?.publicUrl) return next(new AppError('ملف PDF مطلوب', 400));

    const url = req.file.publicUrl;
    const series = String(req.body.series || '').trim();
    let updated = 0;

    if (series) {
      const result = await Lecture.updateMany({ series }, { $set: { pdfUrl: url } });
      updated = result.modifiedCount;
    }

    res.status(201).json({ success: true, data: { url, updated, series } });
  } catch (err) {
    await removeUploadedFiles(req);
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

// The six مقرأة السنة books keep their own `category` (matched by SunnahBooks.jsx
// and CourseDetail.jsx for isnad links), but the reference PDF files them under
// الحديث, so folding them into a الحديث browse request here is display-only.
const HADITH_SUNNAH_BOOK_CATEGORIES = [
  'صحيح البخاري',
  'صحيح مسلم',
  'سنن أبي داود',
  'سنن الترمذي',
  'سنن النسائي',
  'سنن ابن ماجه',
];

export const getCourses = async (req, res, next) => {
  try {
    const filter = buildFilter(req.query);
    if (req.query.category === 'الحديث') {
      filter.category = { $in: ['الحديث', ...HADITH_SUNNAH_BOOK_CATEGORIES] };
    }

    const courses = await Lecture.aggregate([
      { $match: filter },
      { $sort: { order: 1, createdAt: 1 } },
      {
        $addFields: {
          seriesTrim: { $trim: { input: { $ifNull: ['$series', ''] } } },
        },
      },
      {
        $addFields: {
          groupKey: {
            $cond: [
              { $ne: ['$seriesTrim', ''] },
              '$seriesTrim',
              {
                $trim: {
                  input: {
                    $arrayElemAt: [
                      { $split: [{ $ifNull: ['$title', ''] }, '—'] },
                      0,
                    ],
                  },
                },
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: '$groupKey',
          category: { $first: '$category' },
          seriesOrder: { $max: '$seriesOrder' },
          lessonsCount: { $sum: 1 },
          lessonIds: { $push: '$_id' },
          firstLectureId: { $first: '$_id' },
          thumbnailId: { $first: '$youtubeId' },
          youtubeUrl: { $first: '$youtubeUrl' },
        },
      },
      {
        $project: {
          _id: 0,
          seriesName: '$_id',
          category: 1,
          seriesOrder: 1,
          lessonsCount: 1,
          lessonIds: 1,
          firstLectureId: 1,
          thumbnailId: 1,
          youtubeUrl: 1,
        },
      },
    ]);

    courses.sort((a, b) => {
      if (a.seriesOrder !== b.seriesOrder) return (a.seriesOrder || 0) - (b.seriesOrder || 0);
      return a.seriesName.localeCompare(b.seriesName, 'ar');
    });

    res.json({ success: true, data: courses });
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

export const importPlaylist = async (req, res, next) => {
  try {
    const { playlistUrl, category, series } = req.body;
    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) return next(new AppError('رابط قائمة التشغيل غير صالح', 400));

    const existingSeriesNames = await Lecture.distinct('series', { category });
    let seriesOrder;
    if (existingSeriesNames.includes(series)) {
      const existingLecture = await Lecture.findOne({ category, series });
      seriesOrder = existingLecture?.seriesOrder || 0;
    } else {
      const maxSeriesOrderDoc = await Lecture.findOne({ category })
        .sort({ seriesOrder: -1 })
        .select('seriesOrder')
        .lean();
      seriesOrder = (maxSeriesOrderDoc?.seriesOrder || 0) + 1;
    }

    const videos = await fetchPlaylistVideos(playlistId);
    if (!videos.length) {
      return next(new AppError('لم يتم العثور على فيديوهات في قائمة التشغيل', 400));
    }

    const now = new Date();
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const v of videos) {
      const youtubeId = v.id;
      const order = Number(v.index) || 0;
      const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeId}&list=${playlistId}`;
      const title = truncate(v.title || `${series} — الدرس ${order}`);
      const description = truncate(
        `الدرس ${order} من سلسلة (${series}).\n\nالعنوان على يوتيوب: ${v.title}`,
        5000
      );

      const existing = await Lecture.findOne({ youtubeId, series });

      if (existing) {
        const needsUpdate = existing.category !== category || existing.order !== order;
        if (needsUpdate) {
          existing.category = category;
          existing.order = order;
          existing.youtubeUrl = youtubeUrl;
          await existing.save();
          updated += 1;
        } else {
          skipped += 1;
        }
        continue;
      }

      await Lecture.create({
        title,
        youtubeUrl,
        youtubeId,
        category,
        series,
        description,
        order,
        seriesOrder,
        publishedAt: now,
        quizQuestions: [],
        quizItems: [],
      });
      created += 1;
    }

    res.json({
      success: true,
      data: {
        seriesName: series,
        category,
        seriesOrder,
        videosFound: videos.length,
        created,
        updated,
        skipped,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const reorderLessons = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const ops = ids.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index + 1 } },
      },
    }));
    await Lecture.bulkWrite(ops);
    res.json({ success: true, message: 'تم حفظ ترتيب الدروس' });
  } catch (err) {
    next(err);
  }
};

export const reorderSeries = async (req, res, next) => {
  try {
    const { category, seriesNames } = req.body;
    const ops = seriesNames.map((name, index) => ({
      updateMany: {
        filter: { category, series: name },
        update: { $set: { seriesOrder: index + 1 } },
      },
    }));
    await Lecture.bulkWrite(ops);
    res.json({ success: true, message: 'تم حفظ ترتيب السلاسل' });
  } catch (err) {
    next(err);
  }
};
