import Lecture from '../models/Lecture.js';
import Article from '../models/Article.js';
import Book from '../models/Book.js';
import Contact from '../models/Contact.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import Certificate from '../models/Certificate.js';
import LessonQuestion from '../models/LessonQuestion.js';
import AppError from '../utils/AppError.js';
import { escapeRegex } from '../utils/sanitize.js';

export const getStats = async (_req, res, next) => {
  try {
    const [
      lectures,
      articles,
      books,
      contacts,
      unreadContacts,
      students,
      completions,
      certificates,
      pendingQuestions,
    ] = await Promise.all([
      Lecture.countDocuments(),
      Article.countDocuments(),
      Book.countDocuments(),
      Contact.countDocuments(),
      Contact.countDocuments({ read: false }),
      User.countDocuments({ role: 'student' }),
      Progress.countDocuments(),
      Certificate.countDocuments(),
      LessonQuestion.countDocuments({ status: 'pending' }),
    ]);

    const topSeries = await Progress.aggregate([
      { $match: { series: { $ne: '' } } },
      { $group: { _id: '$series', completions: { $sum: 1 } } },
      { $sort: { completions: -1 } },
      { $limit: 5 },
    ]);

    const [recentLectures, recentArticles, recentBooks, recentContacts, recentStudents] =
      await Promise.all([
        Lecture.find().sort({ createdAt: -1 }).limit(5).select('title category createdAt'),
        Article.find().sort({ createdAt: -1 }).limit(5).select('title category createdAt'),
        Book.find().sort({ createdAt: -1 }).limit(5).select('title author createdAt'),
        Contact.find().sort({ createdAt: -1 }).limit(5).select('name subject read createdAt'),
        User.find({ role: 'student' })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('name email phone country createdAt'),
      ]);

    res.json({
      success: true,
      data: {
        counts: {
          lectures,
          articles,
          books,
          contacts,
          unreadContacts,
          students,
          completions,
          certificates,
          pendingQuestions,
        },
        topSeries: topSeries.map((s) => ({ series: s._id, completions: s.completions })),
        recent: {
          lectures: recentLectures,
          articles: recentArticles,
          books: recentBooks,
          contacts: recentContacts,
          students: recentStudents,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();

    const filter = { role: 'student' };
    if (search) {
      const safeSearch = escapeRegex(search.slice(0, 100));
      filter.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
        { phone: { $regex: safeSearch, $options: 'i' } },
        { country: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const [students, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('name email phone country isEmailVerified createdAt'),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: students,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const student = await User.findOneAndDelete({ _id: req.params.id, role: 'student' });
    if (!student) return next(new AppError('الطالب غير موجود', 404));
    res.json({ success: true, message: 'تم حذف حساب الطالب' });
  } catch (err) {
    next(err);
  }
};
