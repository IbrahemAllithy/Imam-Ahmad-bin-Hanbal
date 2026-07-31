import Notification from '../models/Notification.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';
import { hasSmtpConfig, sendNotificationEmail as sendNotifyEmail } from '../utils/mailer.js';

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

    // Fire-and-forget emails
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

export const sendAdminBroadcast = async (req, res, next) => {
  try {
    const { title, body, link = '', sendEmail = true, type = 'system' } = req.body;

    if (!title?.trim() || !body?.trim()) {
      return next(new AppError('عنوان الرسالة ومحتواها مطلوبان', 400));
    }

    const students = await User.find({ role: 'student' }).select('_id name email isEmailVerified');

    if (!students.length) {
      return res.json({
        success: true,
        message: 'لا يوجد طلاب مسجلون حالياً',
        stats: { studentsCount: 0, emailsSent: 0 },
      });
    }

    const docs = students.map((s) => ({
      user: s._id,
      type: type || 'system',
      title: title.trim(),
      body: body.trim(),
      link: link.trim(),
    }));

    await Notification.insertMany(docs);

    let emailsSent = 0;
    if (sendEmail && hasSmtpConfig()) {
      const verifiedStudents = students.filter((s) => s.isEmailVerified);
      const emailResults = await Promise.allSettled(
        verifiedStudents.map((s) =>
          sendNotifyEmail({
            to: s.email,
            name: s.name,
            title: title.trim(),
            body: body.trim(),
            link: link.trim(),
          })
        )
      );

      emailsSent = emailResults.filter((r) => r.status === 'fulfilled').length;
    }

    logger.info('تم إرسال بث جماعي من المشرف', {
      title,
      studentsCount: students.length,
      emailsSent,
    });

    res.json({
      success: true,
      message: `تم إرسال الإشعار لـ ${students.length} طالب بنجاح${sendEmail ? ` (وتم إرسال ${emailsSent} رسالة بريدية)` : ''}`,
      stats: {
        studentsCount: students.length,
        emailsSent,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getBroadcastHistory = async (_req, res, next) => {
  try {
    const history = await Notification.aggregate([
      {
        $group: {
          _id: {
            title: '$title',
            body: '$body',
            link: '$link',
            type: '$type',
            day: { $dateToString: { format: '%Y-%m-%d %H:%M', date: '$createdAt' } },
          },
          sentAt: { $min: '$createdAt' },
          recipients: { $sum: 1 },
          readCount: { $sum: { $cond: ['$read', 1, 0] } },
        },
      },
      { $sort: { sentAt: -1 } },
      { $limit: 100 },
      {
        $project: {
          _id: 0,
          title: '$_id.title',
          body: '$_id.body',
          link: '$_id.link',
          type: '$_id.type',
          sentAt: 1,
          recipients: 1,
          readCount: 1,
        },
      },
    ]);

    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
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
