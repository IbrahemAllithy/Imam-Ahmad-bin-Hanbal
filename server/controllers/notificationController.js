import Notification from '../models/Notification.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import nodemailer from 'nodemailer';
import AppError from '../utils/AppError.js';

const hasSmtpConfig = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const sendNotifyEmail = async ({ to, name, title, body, link }) => {
  if (!hasSmtpConfig()) return;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const site = process.env.CLIENT_URL || 'http://localhost:5173';
  const fullLink = link ? `${site}${link}` : site;

  await transporter.sendMail({
    from,
    to,
    subject: title,
    text: `السلام عليكم ${name}،\n\n${body}\n\n${fullLink}`,
    html: `<div style="font-family:Tahoma,Arial;direction:rtl;text-align:right">
      <p>السلام عليكم ${name}،</p>
      <p>${body}</p>
      <p><a href="${fullLink}">عرض المحتوى</a></p>
    </div>`,
  });
};

export const notifyAllStudents = async ({ type, title, body, link }) => {
  try {
    const students = await User.find({
      role: 'student',
      isEmailVerified: true,
    }).select('_id name email');

    if (!students.length) return { created: 0 };

    const docs = students.map((s) => ({
      user: s._id,
      type,
      title,
      body,
      link: link || '',
    }));

    await Notification.insertMany(docs);

    // Fire-and-forget emails (don't block content create)
    Promise.allSettled(
      students.map((s) =>
        sendNotifyEmail({
          to: s.email,
          name: s.name,
          title,
          body,
          link,
        })
      )
    ).catch((err) => logger.error('فشل إرسال بعض رسائل التنبيه', { error: err.message }));

    return { created: docs.length };
  } catch (err) {
    logger.error('فشل إنشاء التنبيهات', { error: err.message });
    return { created: 0 };
  }
};

export const getMyNotifications = async (req, res, next) => {
  try {
    const items = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unread = await Notification.countDocuments({
      user: req.user._id,
      read: false,
    });

    res.json({ success: true, data: items, unread });
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const item = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );
    if (!item) {
      return next(new AppError('التنبيه غير موجود', 404));
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ success: true, message: 'تم تعليم كل التنبيهات كمقروءة' });
  } catch (err) {
    next(err);
  }
};
