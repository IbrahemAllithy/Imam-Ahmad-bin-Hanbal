import Contact from '../models/Contact.js';
import AppError from '../utils/AppError.js';

export const submitContact = async (req, res, next) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json({
      success: true,
      message: 'تم إرسال رسالتك بنجاح — جزاك الله خيراً',
      data: { id: contact._id },
    });
  } catch (err) {
    next(err);
  }
};

export const getContacts = async (_req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (err) {
    next(err);
  }
};

export const markContactRead = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!contact) return next(new AppError('الرسالة غير موجودة', 404));
    res.json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return next(new AppError('الرسالة غير موجودة', 404));
    res.json({ success: true, message: 'تم حذف الرسالة' });
  } catch (err) {
    next(err);
  }
};
