import SaleBook from '../models/SaleBook.js';
import AppError from '../utils/AppError.js';
import { removeStorageFile } from '../utils/storage.js';
import { removeUploadedFiles } from '../middleware/upload.js';

export const getSaleBooks = async (_req, res, next) => {
  try {
    const books = await SaleBook.find({}).sort({ order: 1, createdAt: 1 }).lean();
    res.json({ success: true, data: books });
  } catch (err) {
    next(err);
  }
};

export const createSaleBook = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('صورة الغلاف مطلوبة', 400));
    }

    const count = await SaleBook.countDocuments();
    const data = {
      title: req.body.title?.trim() || `كتاب ${count + 1}`,
      coverImage: req.file.publicUrl,
      order: count,
    };

    const book = await SaleBook.create(data);
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    await removeUploadedFiles(req);
    next(err);
  }
};

export const updateSaleBook = async (req, res, next) => {
  try {
    const previous = req.file ? await SaleBook.findById(req.params.id).lean() : null;

    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title.trim() || 'كتاب بدون عنوان';
    if (req.file) updates.coverImage = req.file.publicUrl;

    const book = await SaleBook.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!book) {
      await removeUploadedFiles(req);
      return next(new AppError('الكتاب غير موجود', 404));
    }

    if (previous && req.file) removeStorageFile(previous.coverImage);

    res.json({ success: true, data: book });
  } catch (err) {
    await removeUploadedFiles(req);
    next(err);
  }
};

export const deleteSaleBook = async (req, res, next) => {
  try {
    const book = await SaleBook.findByIdAndDelete(req.params.id);
    if (!book) return next(new AppError('الكتاب غير موجود', 404));
    removeStorageFile(book.coverImage);
    res.json({ success: true, message: 'تم حذف الكتاب' });
  } catch (err) {
    next(err);
  }
};
