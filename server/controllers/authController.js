import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';
import {
  validateEmailIdentity,
  validatePersonName,
  normalizeEmail,
  isStrictEmailFormat,
} from '../utils/emailValidation.js';
import {
  generateOtp,
  hashOtp,
  otpExpiresAt,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../utils/mailer.js';

const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';
const REFRESH_COOKIE = 'refreshToken';
const RESET_TTL_MS = 60 * 60 * 1000;
const GENERIC_LOGIN_FAIL = 'بيانات الدخول غير صحيحة';

const signAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });

const signRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

const issueTokens = async (user, res) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
  return accessToken;
};

const assignAndSendOtp = async (user) => {
  const otp = generateOtp();
  user.emailVerificationOTP = hashOtp(otp);
  user.emailVerificationExpires = otpExpiresAt();
  user.isEmailVerified = false;
  await user.save({ validateBeforeSave: false });

  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    otp,
  });
};

export const register = async (req, res, next) => {
  try {
    const { password, phone = '', country = '' } = req.body;

    const nameCheck = validatePersonName(req.body.name);
    if (!nameCheck.ok) {
      return next(new AppError(nameCheck.message, 400, 'name'));
    }

    const emailCheck = await validateEmailIdentity(req.body.email);
    if (!emailCheck.ok) {
      return next(new AppError(emailCheck.message, 400, 'email'));
    }

    const email = emailCheck.email;
    const exists = await User.findOne({ email });
    if (exists) {
      if (exists.isEmailVerified) {
        return next(new AppError('هذا البريد الإلكتروني مسجّل مسبقاً', 409, 'email'));
      }
      exists.name = nameCheck.name;
      exists.password = password;
      exists.phone = phone;
      exists.country = country;
      exists.role = 'student';
      await assignAndSendOtp(exists);

      return res.status(200).json({
        success: true,
        requiresVerification: true,
        message: 'أُرسل رمز التفعيل إلى بريدك الإلكتروني. افتح بريدك وأدخل الرمز هنا.',
        email: exists.email,
      });
    }

    const user = await User.create({
      name: nameCheck.name,
      email,
      password,
      phone,
      country,
      role: 'student',
      isEmailVerified: false,
    });

    await assignAndSendOtp(user);

    logger.info('تسجيل طالب بانتظار التفعيل', { email: user.email, id: user._id });

    res.status(201).json({
      success: true,
      requiresVerification: true,
      message: 'تم إنشاء الحساب. أُرسل رمز التفعيل إلى بريدك الإلكتروني.',
      email: user.email,
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError('هذا البريد الإلكتروني مسجّل مسبقاً', 409, 'email'));
    }
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || '').trim();

    if (!email || !otp) {
      return next(new AppError('البريد ورمز التفعيل مطلوبان', 400));
    }

    const user = await User.findOne({ email }).select(
      '+emailVerificationOTP +emailVerificationExpires +password +refreshTokenHash'
    );
    if (!user) {
      return next(new AppError('لا يوجد حساب مرتبط بهذا البريد', 404, 'email'));
    }

    if (user.isEmailVerified) {
      const accessToken = await issueTokens(user, res);
      return res.json({
        success: true,
        message: 'الحساب مفعّل مسبقاً',
        accessToken,
        user: user.toSafeJSON(),
      });
    }

    if (
      !user.emailVerificationOTP ||
      !user.emailVerificationExpires ||
      user.emailVerificationExpires < new Date()
    ) {
      return next(new AppError('انتهت صلاحية الرمز — اطلب رمزاً جديداً', 400, 'otp'));
    }

    if (hashOtp(otp) !== user.emailVerificationOTP) {
      return next(new AppError('رمز التفعيل غير صحيح', 400, 'otp'));
    }

    user.isEmailVerified = true;
    user.emailVerificationOTP = null;
    user.emailVerificationExpires = null;
    await user.save({ validateBeforeSave: false });

    const accessToken = await issueTokens(user, res);

    res.json({
      success: true,
      message: 'تم تفعيل الحساب بنجاح',
      accessToken,
      user: user.toSafeJSON(),
    });
  } catch (err) {
    next(err);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const emailCheck = await validateEmailIdentity(req.body.email);
    if (!emailCheck.ok) {
      return next(new AppError(emailCheck.message, 400, 'email'));
    }

    const user = await User.findOne({ email: emailCheck.email });
    if (!user) {
      return next(new AppError('لا يوجد حساب مرتبط بهذا البريد', 404, 'email'));
    }

    if (user.isEmailVerified) {
      return next(new AppError('الحساب مفعّل بالفعل — يمكنك تسجيل الدخول', 400, 'email'));
    }

    await assignAndSendOtp(user);

    res.json({
      success: true,
      message: 'تم إرسال رمز تفعيل جديد إلى بريدك الإلكتروني',
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !isStrictEmailFormat(email)) {
      return next(new AppError('صيغة البريد الإلكتروني غير صحيحة', 400, 'email'));
    }

    const user = await User.findOne({ email }).select('+password +refreshTokenHash');
    if (!user) {
      logger.security('محاولة دخول فاشلة — مستخدم غير موجود', { email });
      return next(new AppError(GENERIC_LOGIN_FAIL, 401));
    }

    if (user.role === 'student' && !user.isEmailVerified) {
      return next(
        new AppError(
          'يجب تفعيل البريد الإلكتروني أولاً عبر رمز التأكيد',
          403,
          'email'
        )
      );
    }

    if (user.isLocked) {
      logger.security('محاولة دخول على حساب مقفل', { email });
      return next(
        new AppError('الحساب مقفل مؤقتاً بسبب محاولات فاشلة — حاول لاحقاً', 401)
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementFailedAttempts();
      logger.security('محاولة دخول فاشلة — كلمة مرور خاطئة', { email });
      return next(new AppError(GENERIC_LOGIN_FAIL, 401));
    }

    await user.resetFailedAttempts();

    const accessToken = await issueTokens(user, res);

    res.json({
      success: true,
      accessToken,
      user: user.toSafeJSON(),
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (!token) return next(new AppError('انتهت الجلسة — يرجى تسجيل الدخول', 401));

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshTokenHash');
    if (!user) return next(new AppError('المستخدم غير موجود', 401));

    if (!user.refreshTokenHash || user.refreshTokenHash !== hashToken(token)) {
      res.clearCookie(REFRESH_COOKIE, cookieOptions);
      return next(new AppError('انتهت الجلسة — يرجى تسجيل الدخول', 401));
    }

    if (user.role === 'student' && !user.isEmailVerified) {
      return next(new AppError('الحساب غير مفعّل', 403));
    }

    const accessToken = await issueTokens(user, res);
    res.json({ success: true, accessToken });
  } catch {
    res.clearCookie(REFRESH_COOKIE, cookieOptions);
    next(new AppError('انتهت الجلسة — يرجى تسجيل الدخول', 401));
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id).select('+refreshTokenHash');
        if (user) {
          user.refreshTokenHash = null;
          await user.save({ validateBeforeSave: false });
        }
      } catch {
        // ignore invalid cookie
      }
    }
    res.clearCookie(REFRESH_COOKIE, cookieOptions);
    res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email || !isStrictEmailFormat(email)) {
      return next(new AppError('صيغة البريد الإلكتروني غير صحيحة', 400, 'email'));
    }

    const user = await User.findOne({ email });
    const okMessage = 'إن وُجد حساب بهذا البريد فستصلك رسالة لإعادة تعيين كلمة المرور.';

    if (!user) {
      return res.json({ success: true, message: okMessage });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = hashToken(rawToken);
    user.passwordResetExpires = new Date(Date.now() + RESET_TTL_MS);
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        token: rawToken,
      });
    } catch (err) {
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save({ validateBeforeSave: false });
      return next(err);
    }

    res.json({ success: true, message: okMessage });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return next(new AppError('الرمز وكلمة المرور الجديدة مطلوبان', 400));
    }
    if (String(password).length < 8) {
      return next(new AppError('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 400, 'password'));
    }

    const user = await User.findOne({
      passwordResetToken: hashToken(String(token)),
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires +refreshTokenHash');

    if (!user) {
      return next(new AppError('رابط إعادة التعيين غير صالح أو منتهٍ', 400));
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.refreshTokenHash = null;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    res.json({
      success: true,
      message: 'تم تحديث كلمة المرور بنجاح — يمكنك تسجيل الدخول الآن',
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user.toSafeJSON
      ? req.user.toSafeJSON()
      : {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone || '',
          country: req.user.country || '',
          role: req.user.role,
          isEmailVerified: Boolean(req.user.isEmailVerified),
          createdAt: req.user.createdAt,
        },
  });
};
