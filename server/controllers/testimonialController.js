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

export const reorderTestimonials = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const ops = ids.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index + 1 } },
      },
    }));
    await Testimonial.bulkWrite(ops);
    res.json({ success: true, message: 'تم حفظ ترتيب الشهادات' });
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
      // Reordering writes 1-based positions, so a new entry has to start past the last one
      // to land at the end rather than tying with it.
      order: count + 1,
    };
    if (req.files?.photo?.[0]) data.photo = req.files.photo[0].publicUrl;
    if (req.files?.video?.[0]) data.video = req.files.video[0].publicUrl;

    const testimonial = await Testimonial.create(data);
    res.status(201).json({ success: true, data: testimonial });
  } catch (err) {
    await removeUploadedFiles(req);
    next(err);
  }
};

export const updateTestimonial = async (req, res, next) => {
  try {
    const hasNewFile = req.files?.photo?.[0] || req.files?.video?.[0];
    const previous = hasNewFile ? await Testimonial.findById(req.params.id).lean() : null;

    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.quote !== undefined) updates.quote = req.body.quote;
    if (req.files?.photo?.[0]) updates.photo = req.files.photo[0].publicUrl;
    if (req.files?.video?.[0]) updates.video = req.files.video[0].publicUrl;

    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!testimonial) {
      await removeUploadedFiles(req);
      return next(new AppError('الشهادة غير موجودة', 404));
    }

    if (previous && req.files?.photo?.[0]) removeStorageFile(previous.photo);
    if (previous && req.files?.video?.[0]) removeStorageFile(previous.video);

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
    removeStorageFile(testimonial.video);
    res.json({ success: true, message: 'تم حذف الشهادة' });
  } catch (err) {
    next(err);
  }
};
