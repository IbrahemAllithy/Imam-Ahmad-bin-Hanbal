import Article from '../models/Article.js';
import AppError from '../utils/AppError.js';
import { removeStorageFile } from '../utils/storage.js';
import { notifyAllStudents } from './notificationController.js';
import { publishedFilter, normalizePublishedAt } from '../utils/publish.js';
import { escapeRegex } from '../utils/sanitize.js';
import { removeUploadedFiles } from '../middleware/upload.js';

const buildFilter = (query, { includeUnpublished = false } = {}) => {
  const filter = includeUnpublished ? {} : { ...publishedFilter() };
  if (query.category) filter.category = query.category;
  if (query.search) {
    const search = escapeRegex(String(query.search).slice(0, 100));
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ],
    });
  }
  return filter;
};

export const getArticles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;
    const includeUnpublished = req.query.all === '1' && req.user?.role === 'admin';
    const filter = buildFilter(req.query, { includeUnpublished });

    const [articles, total] = await Promise.all([
      Article.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Article.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: articles,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const getArticle = async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const filter = isAdmin ? { _id: req.params.id } : { _id: req.params.id, ...publishedFilter() };
    const article = await Article.findOne(filter);
    if (!article) return next(new AppError('المقال غير موجود', 404));

    const related = await Article.find({
      _id: { $ne: article._id },
      category: article.category,
      ...publishedFilter(),
    })
      .sort({ createdAt: -1 })
      .limit(4);

    res.json({ success: true, data: article, related });
  } catch (err) {
    next(err);
  }
};

export const createArticle = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.coverImage = `/storage/covers/${req.file.filename}`;
    }
    if (!data.excerpt && data.content) {
      data.excerpt = data.content.replace(/<[^>]+>/g, '').slice(0, 200);
    }
    if (data.publishedAt === '' || data.publishedAt === undefined) {
      data.publishedAt = new Date();
    } else {
      data.publishedAt = normalizePublishedAt(data.publishedAt);
    }

    const article = await Article.create(data);

    notifyAllStudents({
      type: 'article',
      title: 'مقال جديد',
      body: `تمت إضافة مقال: ${article.title}`,
      link: `/articles/${article._id}`,
    });

    res.status(201).json({ success: true, data: article });
  } catch (err) {
    await removeUploadedFiles(req);
    next(err);
  }
};

export const updateArticle = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    const previous = req.file ? await Article.findById(req.params.id) : null;
    if (req.file) {
      updates.coverImage = `/storage/covers/${req.file.filename}`;
    }

    const article = await Article.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!article) {
      await removeUploadedFiles(req);
      return next(new AppError('المقال غير موجود', 404));
    }
    if (previous?.coverImage) removeStorageFile(previous.coverImage);

    res.json({ success: true, data: article });
  } catch (err) {
    await removeUploadedFiles(req);
    next(err);
  }
};

export const deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return next(new AppError('المقال غير موجود', 404));
    removeStorageFile(article.coverImage);
    res.json({ success: true, message: 'تم حذف المقال' });
  } catch (err) {
    next(err);
  }
};
