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
import { R2_ENABLED } from '../config/r2.js';

// Reports which R2 env vars the running process actually sees, without leaking their values —
// lets an admin confirm a Render env-var change actually took effect after a deploy.
export const getStorageDiagnostics = async (_req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        r2Enabled: R2_ENABLED,
        r2Vars: {
          R2_ACCOUNT_ID: Boolean(process.env.R2_ACCOUNT_ID),
          R2_ACCESS_KEY_ID: Boolean(process.env.R2_ACCESS_KEY_ID),
          R2_SECRET_ACCESS_KEY: Boolean(process.env.R2_SECRET_ACCESS_KEY),
          R2_BUCKET_NAME: Boolean(process.env.R2_BUCKET_NAME),
          R2_PUBLIC_URL: Boolean(process.env.R2_PUBLIC_URL),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

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

    const [students, total, verifiedTotal] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('name email phone country isEmailVerified createdAt'),
      User.countDocuments(filter),
      User.countDocuments({ ...filter, isEmailVerified: true }),
    ]);

    res.json({
      success: true,
      data: students,
      verifiedTotal,
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

    await Promise.all([
      Certificate.deleteMany({ user: student._id }),
      Progress.deleteMany({ user: student._id }),
      LessonQuestion.deleteMany({ user: student._id }),
    ]);

    res.json({ success: true, message: 'تم حذف حساب الطالب وكل بياناته المرتبطة' });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { name, phone, country, role } = req.body;
    const target = await User.findById(req.params.id);
    if (!target) return next(new AppError('المستخدم غير موجود', 404));

    if (role && role !== target.role) {
      if (String(target._id) === String(req.user._id)) {
        return next(new AppError('لا يمكنك تغيير دورك الخاص', 400));
      }
      if (target.role === 'admin' && role === 'student') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
          return next(new AppError('لا يمكن إزالة صلاحية آخر أدمن في الموقع', 400));
        }
      }
      target.role = role;
    }

    if (name !== undefined) target.name = name;
    if (phone !== undefined) target.phone = phone;
    if (country !== undefined) target.country = country;

    await target.save();
    res.json({ success: true, data: target.toSafeJSON() });
  } catch (err) {
    next(err);
  }
};

export const getAdmins = async (_req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .sort({ createdAt: 1 })
      .select('name email phone country isEmailVerified createdAt');
    res.json({ success: true, data: admins });
  } catch (err) {
    next(err);
  }
};

export const deleteAdmin = async (req, res, next) => {
  try {
    if (req.params.id === String(req.user._id)) {
      return next(new AppError('لا يمكنك حذف حسابك الخاص', 400));
    }
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      return next(new AppError('لا يمكن حذف آخر أدمن في الموقع', 400));
    }
    const admin = await User.findOneAndDelete({ _id: req.params.id, role: 'admin' });
    if (!admin) return next(new AppError('حساب الأدمن غير موجود', 404));
    res.json({ success: true, message: 'تم حذف حساب الأدمن' });
  } catch (err) {
    next(err);
  }
};

export const getStudentProgress = async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' }).select(
      'name email'
    );
    if (!student) return next(new AppError('الطالب غير موجود', 404));

    const [progress, certificates] = await Promise.all([
      Progress.find({ user: req.params.id })
        .populate('lecture', 'title series category order')
        .sort({ completedAt: -1 }),
      Certificate.find({ user: req.params.id }).sort({ issuedAt: -1 }),
    ]);

    res.json({
      success: true,
      data: { student, progress, certificates },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllCertificates = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();

    const filter = {};
    if (search) {
      const safeSearch = escapeRegex(search.slice(0, 100));
      filter.$or = [
        { series: { $regex: safeSearch, $options: 'i' } },
        { code: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const [certificates, total] = await Promise.all([
      Certificate.find(filter)
        .populate('user', 'name email')
        .sort({ issuedAt: -1 })
        .skip(skip)
        .limit(limit),
      Certificate.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: certificates,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const issueCertificate = async (req, res, next) => {
  try {
    const { userId, series } = req.body;
    const student = await User.findOne({ _id: userId, role: 'student' });
    if (!student) return next(new AppError('الطالب غير موجود', 404));

    const seriesExists = await Lecture.exists({ series });
    if (!seriesExists) {
      return next(new AppError('اسم السلسلة غير مطابق لأي دورة موجودة فعلياً', 400));
    }

    const existing = await Certificate.findOne({ user: userId, series });
    if (existing) return next(new AppError('الطالب لديه شهادة لهذه الدورة بالفعل', 400));

    const certificate = await Certificate.create({
      user: userId,
      series,
      code: Certificate.generateCode(),
    });

    res.status(201).json({ success: true, data: certificate });
  } catch (err) {
    next(err);
  }
};

export const deleteCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findByIdAndDelete(req.params.id);
    if (!certificate) return next(new AppError('الشهادة غير موجودة', 404));
    res.json({ success: true, message: 'تم إلغاء الشهادة' });
  } catch (err) {
    next(err);
  }
};
