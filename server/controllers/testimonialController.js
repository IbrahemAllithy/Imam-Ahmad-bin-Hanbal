import Testimonial from '../models/Testimonial.js';
import AppError from '../utils/AppError.js';
import { removeStorageFile } from '../utils/storage.js';
import { removeUploadedFiles } from '../middleware/upload.js';

export const getTestimonials = async (_req, res, next) => {
  try {
    const testimonials = await Testimonial.find({}).sort({ order: 1, createdAt: -1 }).lean();
    res.json({ success: true, data: testimonials });
  } catch (err) {
    next(err);
  }
};

export const createTestimonial = async (req, res, next) => {
  try {
    const count = await Testimonial.countDocuments();
    const data = {
      name: req.body.name,
      title: req.body.title || '',
      quote: req.body.quote,
      order: count,
    };
    if (req.file) data.photo = `/storage/covers/${req.file.filename}`;

    const testimonial = await Testimonial.create(data);
    res.status(201).json({ success: true, data: testimonial });
  } catch (err) {
    await removeUploadedFiles(req);
    next(err);
  }
};

export const updateTestimonial = async (req, res, next) => {
  try {
    const previous = req.file ? await Testimonial.findById(req.params.id).lean() : null;

    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.quote !== undefined) updates.quote = req.body.quote;
    if (req.file) updates.photo = `/storage/covers/${req.file.filename}`;

    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!testimonial) {
      await removeUploadedFiles(req);
      return next(new AppError('الشهادة غير موجودة', 404));
    }

    if (previous && req.file) removeStorageFile(previous.photo);

    res.json({ success: true, data: testimonial });
  } catch (err) {
    await removeUploadedFiles(req);
    next(err);
  }
};

export const deleteTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return next(new AppError('الشهادة غير موجودة', 404));
    removeStorageFile(testimonial.photo);
    res.json({ success: true, message: 'تم حذف الشهادة' });
  } catch (err) {
    next(err);
  }
};
