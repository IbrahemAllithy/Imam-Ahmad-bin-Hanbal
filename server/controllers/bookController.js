import Book from '../models/Book.js';
import AppError from '../utils/AppError.js';
import { removeStorageFile } from '../utils/storage.js';
import { notifyAllStudents } from './notificationController.js';
import { publishedFilter, normalizePublishedAt } from '../utils/publish.js';

const buildFilter = (query, { includeUnpublished = false } = {}) => {
  const filter = includeUnpublished ? {} : { ...publishedFilter() };
  if (query.category) filter.category = query.category;
  if (query.search) {
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { title: { $regex: query.search, $options: 'i' } },
        { author: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ],
    });
  }
  return filter;
};

export const getBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;
    const includeUnpublished = req.query.all === '1' && req.user?.role === 'admin';
    const filter = buildFilter(req.query, { includeUnpublished });

    const [books, total] = await Promise.all([
      Book.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Book.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: books,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return next(new AppError('الكتاب غير موجود', 404));

    const related = await Book.find({
      _id: { $ne: book._id },
      category: book.category,
      ...publishedFilter(),
    })
      .sort({ createdAt: -1 })
      .limit(4);

    res.json({ success: true, data: book, related });
  } catch (err) {
    next(err);
  }
};

export const createBook = async (req, res, next) => {
  try {
    const data = { ...req.body };

    if (req.files?.pdf?.[0]) {
      data.pdfUrl = `/storage/pdfs/${req.files.pdf[0].filename}`;
    } else if (req.body.pdfUrl) {
      data.pdfUrl = req.body.pdfUrl;
    } else {
      return next(new AppError('ملف PDF أو رابط القراءة مطلوب', 400));
    }

    if (req.files?.coverImage?.[0]) {
      data.coverImage = `/storage/covers/${req.files.coverImage[0].filename}`;
    }

    if (data.pages) data.pages = Number(data.pages) || 1;
    if (data.publishedAt === '' || data.publishedAt === undefined) {
      data.publishedAt = new Date();
    } else {
      data.publishedAt = normalizePublishedAt(data.publishedAt);
    }

    const book = await Book.create(data);

    notifyAllStudents({
      type: 'book',
      title: 'كتاب جديد',
      body: `تمت إضافة كتاب: ${book.title}`,
      link: `/books/${book._id}`,
    });

    res.status(201).json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

export const updateBook = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    const needsPrevious = req.files?.pdf?.[0] || req.files?.coverImage?.[0];
    const previous = needsPrevious ? await Book.findById(req.params.id) : null;

    if (req.files?.pdf?.[0]) {
      updates.pdfUrl = `/storage/pdfs/${req.files.pdf[0].filename}`;
    }
    if (req.files?.coverImage?.[0]) {
      updates.coverImage = `/storage/covers/${req.files.coverImage[0].filename}`;
    }
    if (updates.pages !== undefined) {
      updates.pages = Number(updates.pages) || 1;
    }

    const book = await Book.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!book) return next(new AppError('الكتاب غير موجود', 404));

    if (previous && req.files?.pdf?.[0]) removeStorageFile(previous.pdfUrl);
    if (previous && req.files?.coverImage?.[0]) removeStorageFile(previous.coverImage);

    res.json({ success: true, data: book });
  } catch (err) {
    next(err);
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return next(new AppError('الكتاب غير موجود', 404));
    removeStorageFile(book.pdfUrl);
    removeStorageFile(book.coverImage);
    res.json({ success: true, message: 'تم حذف الكتاب' });
  } catch (err) {
    next(err);
  }
};
