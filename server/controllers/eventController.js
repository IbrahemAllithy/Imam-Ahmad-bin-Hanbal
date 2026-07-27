import Event from '../models/Event.js';
import AppError from '../utils/AppError.js';
import { removeStorageFile } from '../utils/storage.js';
import { removeUploadedFiles } from '../middleware/upload.js';

export const getEvents = async (_req, res, next) => {
  try {
    const events = await Event.find({}).sort({ eventDate: -1 }).lean();
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).lean();
    if (!event) return next(new AppError('الفعالية غير موجودة', 404));
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const data = {
      title: req.body.title,
      description: req.body.description || '',
      eventDate: req.body.eventDate,
    };
    if (req.file) data.coverImage = `/storage/covers/${req.file.filename}`;

    const event = await Event.create(data);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    await removeUploadedFiles(req);
    next(err);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const previous = req.file ? await Event.findById(req.params.id).lean() : null;

    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.eventDate !== undefined) updates.eventDate = req.body.eventDate;
    if (req.file) updates.coverImage = `/storage/covers/${req.file.filename}`;

    const event = await Event.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!event) {
      await removeUploadedFiles(req);
      return next(new AppError('الفعالية غير موجودة', 404));
    }

    if (previous && req.file) removeStorageFile(previous.coverImage);

    res.json({ success: true, data: event });
  } catch (err) {
    await removeUploadedFiles(req);
    next(err);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return next(new AppError('الفعالية غير موجودة', 404));
    removeStorageFile(event.coverImage);
    res.json({ success: true, message: 'تم حذف الفعالية' });
  } catch (err) {
    next(err);
  }
};
