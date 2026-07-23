import nodemailer from 'nodemailer';
import crypto from 'crypto';
import logger from './logger.js';
import AppError from './AppError.js';

const OTP_LENGTH = 6;
const OTP_TTL_MS = 10 * 60 * 1000;

export const generateOtp = () => {
  const num = crypto.randomInt(0, 10 ** OTP_LENGTH);
  return String(num).padStart(OTP_LENGTH, '0');
};

export const hashOtp = (otp) =>
  crypto.createHash('sha256').update(String(otp)).digest('hex');

export const otpExpiresAt = () => new Date(Date.now() + OTP_TTL_MS);

export const hasSmtpConfig = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const createTransport = () => {
  if (!hasSmtpConfig()) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendVerificationEmail = async ({ to, name, otp }) => {
  if (!hasSmtpConfig()) {
    throw new AppError(
      'إرسال البريد غير مفعّل حالياً. يرجى ضبط إعدادات SMTP في الخادم ثم المحاولة مجدداً.',
      503
    );
  }

  const transporter = createTransport();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const subject = 'رمز تفعيل حسابك — الموقع الرسمي للشيخ شعبان العودة';
  const text = `السلام عليكم ${name}،

رمز تفعيل حسابك هو: ${otp}

صالح لمدة 10 دقائق فقط.
إذا لم تطلب إنشاء حساب فتجاهل هذه الرسالة.`;

  const html = `
    <div style="font-family:Tahoma,Arial,sans-serif;direction:rtl;text-align:right;line-height:1.7">
      <p>السلام عليكم ${name}،</p>
      <p>رمز تفعيل حسابك هو:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:6px;color:#6b4f2c">${otp}</p>
      <p>الرمز صالح لمدة <strong>10 دقائق</strong> فقط.</p>
      <p style="color:#666">إذا لم تطلب إنشاء حساب فتجاهل هذه الرسالة.</p>
    </div>
  `;

  try {
    await transporter.sendMail({ from, to, subject, text, html });
    logger.info('تم إرسال رمز التفعيل إلى البريد', { to });
    return { sent: true };
  } catch (err) {
    logger.error('فشل إرسال بريد التفعيل', { to, error: err.message });
    throw new AppError(
      'تعذر إرسال رمز التفعيل إلى بريدك. تحقق من إعدادات البريد أو حاول لاحقاً.',
      502
    );
  }
};

export const sendPasswordResetEmail = async ({ to, name, token }) => {
  if (!hasSmtpConfig()) {
    throw new AppError(
      'إرسال البريد غير مفعّل حالياً. يرجى ضبط إعدادات SMTP في الخادم ثم المحاولة مجدداً.',
      503
    );
  }

  const transporter = createTransport();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const resetUrl = `${clientUrl}/reset-password?token=${encodeURIComponent(token)}`;

  const subject = 'إعادة تعيين كلمة المرور — الموقع الرسمي للشيخ شعبان العودة';
  const text = `السلام عليكم ${name}،

لإعادة تعيين كلمة المرور افتح الرابط التالي (صالح لمدة ساعة):
${resetUrl}

إذا لم تطلب ذلك فتجاهل هذه الرسالة.`;

  const html = `
    <div style="font-family:Tahoma,Arial,sans-serif;direction:rtl;text-align:right;line-height:1.7">
      <p>السلام عليكم ${name}،</p>
      <p>لإعادة تعيين كلمة المرور اضغط الرابط التالي:</p>
      <p><a href="${resetUrl}" style="color:#6b4f2c;font-weight:bold">تعيين كلمة مرور جديدة</a></p>
      <p>الرابط صالح لمدة <strong>ساعة واحدة</strong> فقط.</p>
      <p style="color:#666">إذا لم تطلب ذلك فتجاهل هذه الرسالة.</p>
    </div>
  `;

  try {
    await transporter.sendMail({ from, to, subject, text, html });
    logger.info('تم إرسال بريد إعادة تعيين كلمة المرور', { to });
    return { sent: true };
  } catch (err) {
    logger.error('فشل إرسال بريد إعادة التعيين', { to, error: err.message });
    throw new AppError(
      'تعذر إرسال بريد إعادة التعيين. تحقق من إعدادات البريد أو حاول لاحقاً.',
      502
    );
  }
};

export const sendContactNotificationEmail = async ({
  to,
  name,
  email,
  subject,
  message,
}) => {
  if (!hasSmtpConfig() || !to) {
    return { sent: false };
  }

  const transporter = createTransport();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const topic = subject?.trim() || 'بدون موضوع';

  const mailSubject = `رسالة تواصل جديدة: ${topic}`;
  const text = `رسالة جديدة من نموذج التواصل

الاسم: ${name}
البريد: ${email}
الموضوع: ${topic}

الرسالة:
${message}`;

  const html = `
    <div style="font-family:Tahoma,Arial,sans-serif;direction:rtl;text-align:right;line-height:1.7">
      <h2 style="color:#6b4f2c">رسالة تواصل جديدة</h2>
      <p><strong>الاسم:</strong> ${name}</p>
      <p><strong>البريد:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>الموضوع:</strong> ${topic}</p>
      <hr />
      <p style="white-space:pre-wrap">${message}</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject: mailSubject,
      text,
      html,
    });
    logger.info('تم إرسال إشعار رسالة التواصل', { to });
    return { sent: true };
  } catch (err) {
    logger.error('فشل إرسال إشعار رسالة التواصل', { to, error: err.message });
    return { sent: false };
  }
};
