import Article from '../models/Article.js';
import AppError from '../utils/AppError.js';

const buildFilter = (query) => {
  const filter = {};
  if (query.category) filter.category = query.category;
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: 'i' } },
      { excerpt: { $regex: query.search, $options: 'i' } },
      { content: { $regex: query.search, $options: 'i' } },
    ];
  }
  return filter;
};

export const getArticles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;
    const filter = buildFilter(req.query);

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
    const article = await Article.findById(req.params.id);
    if (!article) return next(new AppError('المقال غير موجود', 404));

    const related = await Article.find({
      _id: { $ne: article._id },
      category: article.category,
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

    const article = await Article.create(data);
    res.status(201).json({ success: true, data: article });
  } catch (err) {
    next(err);
  }
};

export const updateArticle = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (req.file) {
      updates.coverImage = `/storage/covers/${req.file.filename}`;
    }

    const article = await Article.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!article) return next(new AppError('المقال غير موجود', 404));

    res.json({ success: true, data: article });
  } catch (err) {
    next(err);
  }
};

export const deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return next(new AppError('المقال غير موجود', 404));
    res.json({ success: true, message: 'تم حذف المقال' });
  } catch (err) {
    next(err);
  }
};
