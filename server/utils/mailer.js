import crypto from 'crypto';
import logger from './logger.js';
import AppError from './AppError.js';
import CLIENT_URL from '../config/clientUrl.js';

const OTP_LENGTH = 6;
const OTP_TTL_MS = 10 * 60 * 1000;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export const generateOtp = () => {
  const num = crypto.randomInt(0, 10 ** OTP_LENGTH);
  return String(num).padStart(OTP_LENGTH, '0');
};

export const hashOtp = (otp) =>
  crypto.createHash('sha256').update(String(otp)).digest('hex');

export const otpExpiresAt = () => new Date(Date.now() + OTP_TTL_MS);

// Cloud hosts commonly block outbound SMTP ports (25/465/587) on free
// instances, so mail goes out over Brevo's HTTPS API instead — same
// transport, no port ever gets blocked.
export const hasSmtpConfig = () => Boolean(process.env.BREVO_API_KEY);

const parseSender = () => {
  const raw = process.env.SMTP_FROM || process.env.SMTP_USER || '';
  const match = raw.match(/^(.*)<(.+)>$/);
  if (match) {
    return { name: match[1].trim().replace(/^"|"$/g, ''), email: match[2].trim() };
  }
  return { email: raw };
};

const sendViaBrevo = async ({ to, subject, text, html }) => {
  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: parseSender(),
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Brevo API ${res.status}: ${body}`);
  }

  return res.json();
};

export const sendVerificationEmail = async ({ to, name, otp }) => {
  if (!hasSmtpConfig()) {
    throw new AppError(
      'إرسال البريد غير مفعّل حالياً. يرجى ضبط إعدادات البريد في الخادم ثم المحاولة مجدداً.',
      503
    );
  }

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
    await sendViaBrevo({ to, subject, text, html });
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
      'إرسال البريد غير مفعّل حالياً. يرجى ضبط إعدادات البريد في الخادم ثم المحاولة مجدداً.',
      503
    );
  }

  const clientUrl = CLIENT_URL;
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
    await sendViaBrevo({ to, subject, text, html });
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
    await sendViaBrevo({ to, subject: mailSubject, text, html });
    logger.info('تم إرسال إشعار رسالة التواصل', { to });
    return { sent: true };
  } catch (err) {
    logger.error('فشل إرسال إشعار رسالة التواصل', { to, error: err.message });
    return { sent: false };
  }
};

export const sendNotificationEmail = async ({ to, name, title, body, link }) => {
  if (!hasSmtpConfig()) return { sent: false };

  const site = CLIENT_URL;
  const fullLink = link ? `${site}${link}` : site;

  const text = `السلام عليكم ${name}،\n\n${body}\n\n${fullLink}`;
  const html = `
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
  `;

  try {
    await sendViaBrevo({ to, subject: title, text, html });
    return { sent: true };
  } catch (err) {
    logger.error('فشل إرسال بريد التنبيه', { to, error: err.message });
    return { sent: false };
  }
};
