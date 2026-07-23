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
    html: `
      <div style="font-family:Tahoma,Arial,sans-serif;direction:rtl;text-align:right;line-height:1.8;padding:20px;background:#faf6ee;border:1px solid #e8dfd0;border-radius:12px">
        <h2 style="color:#6b4f2c;margin-top:0">${title}</h2>
        <p style="color:#333;font-size:16px">السلام عليكم <strong>${name}</strong>،</p>
        <div style="background:#fff;padding:16px;border-radius:8px;border-right:4px solid #6b4f2c;margin:15px 0">
          <p style="margin:0;white-space:pre-wrap;color:#444">${body}</p>
        </div>
        ${
          link
            ? `<p><a href="${fullLink}" style="display:inline-block;padding:10px 20px;background:#6b4f2c;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold">عرض التفاصيل بالموقع</a></p>`
            : ''
        }
        <hr style="border:none;border-top:1px solid #e8dfd0;margin:20px 0" />
        <p style="font-size:12px;color:#888;margin:0">الموقع الرسمي لفضيلة الشيخ شعبان العودة</p>
      </div>
    `,
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
