import { body, param, query, validationResult } from 'express-validator';
import { extractYoutubeId } from '../utils/youtube.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => e.msg).join(' — ');
    return res.status(400).json({ success: false, message });
  }
  next();
};

export const loginValidation = [
  body('email').trim().isEmail().withMessage('صيغة البريد الإلكتروني غير صحيحة'),
  body('password').isLength({ min: 8 }).withMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  validate,
];

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('الاسم مطلوب').isLength({ min: 3, max: 100 }).withMessage('الاسم يجب أن يكون بين 3 و100 حرف'),
  body('email').trim().isEmail().withMessage('صيغة البريد الإلكتروني غير صحيحة'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .isLength({ max: 128 })
    .withMessage('كلمة المرور طويلة جداً'),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 30 }).withMessage('رقم الهاتف طويل جداً'),
  body('country').optional({ checkFalsy: true }).trim().isLength({ max: 80 }).withMessage('اسم الدولة طويل جداً'),
  validate,
];

export const verifyEmailValidation = [
  body('email').trim().isEmail().withMessage('صيغة البريد الإلكتروني غير صحيحة'),
  body('otp').trim().notEmpty().withMessage('رمز التفعيل مطلوب').isLength({ min: 4, max: 8 }).withMessage('رمز التفعيل غير صالح'),
  validate,
];

export const resendOtpValidation = [
  body('email').trim().isEmail().withMessage('صيغة البريد الإلكتروني غير صحيحة'),
  validate,
];

export const lectureValidation = [
  body('title').trim().notEmpty().withMessage('عنوان المحاضرة مطلوب').isLength({ max: 200 }).withMessage('العنوان طويل جداً'),
  body('youtubeUrl')
    .trim()
    .notEmpty()
    .withMessage('رابط اليوتيوب مطلوب')
    .custom((value) => {
      if (!extractYoutubeId(value)) throw new Error('رابط اليوتيوب غير صالح');
      return true;
    }),
  body('description').optional().trim().isLength({ max: 5000 }).withMessage('الوصف طويل جداً'),
  body('series').optional().trim().isLength({ max: 150 }).withMessage('اسم السلسلة طويل جداً'),
  body('category').optional().trim().isLength({ max: 100 }).withMessage('التصنيف طويل جداً'),
  validate,
];

export const articleValidation = [
  body('title').trim().notEmpty().withMessage('عنوان المقال مطلوب').isLength({ max: 200 }).withMessage('العنوان طويل جداً'),
  body('content').trim().notEmpty().withMessage('محتوى المقال مطلوب').isLength({ max: 50000 }).withMessage('المحتوى طويل جداً'),
  body('excerpt').optional().trim().isLength({ max: 500 }).withMessage('المقتطف طويل جداً'),
  body('category').optional().trim().isLength({ max: 100 }).withMessage('التصنيف طويل جداً'),
  validate,
];

export const bookValidation = [
  body('title').trim().notEmpty().withMessage('عنوان الكتاب مطلوب').isLength({ max: 200 }).withMessage('العنوان طويل جداً'),
  body('author').trim().notEmpty().withMessage('اسم المؤلف مطلوب').isLength({ max: 150 }).withMessage('اسم المؤلف طويل جداً'),
  body('description').optional().trim().isLength({ max: 5000 }).withMessage('الوصف طويل جداً'),
  body('pages').optional().isInt({ min: 1 }).withMessage('عدد الصفحات غير صالح'),
  body('category').optional().trim().isLength({ max: 100 }).withMessage('التصنيف طويل جداً'),
  body('pdfUrl').optional().trim().isLength({ max: 2000 }).withMessage('رابط PDF طويل جداً'),
  validate,
];

export const contactValidation = [
  body('name').trim().notEmpty().withMessage('الاسم مطلوب').isLength({ max: 100 }).withMessage('الاسم طويل جداً'),
  body('email').trim().isEmail().withMessage('صيغة البريد الإلكتروني غير صحيحة'),
  body('subject').optional().trim().isLength({ max: 200 }).withMessage('الموضوع طويل جداً'),
  body('message').trim().notEmpty().withMessage('الرسالة مطلوبة').isLength({ max: 2000 }).withMessage('الرسالة طويلة جداً'),
  validate,
];

export const mongoIdParam = [
  param('id').isMongoId().withMessage('المعرف غير صالح'),
  validate,
];

export const listQueryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('رقم الصفحة غير صالح'),
  query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('حد العرض غير صالح'),
  query('category').optional().trim().isLength({ max: 100 }).withMessage('التصنيف غير صالح'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('نص البحث طويل جداً'),
  validate,
];
