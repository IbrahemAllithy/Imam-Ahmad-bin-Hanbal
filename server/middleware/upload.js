import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { fileTypeFromBuffer } from 'file-type';
import AppError from '../utils/AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_ROOT = path.join(__dirname, '..', 'storage');
const PDF_DIR = path.join(STORAGE_ROOT, 'pdfs');
const COVER_DIR = path.join(STORAGE_ROOT, 'covers');

[STORAGE_ROOT, PDF_DIR, COVER_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const ALLOWED_IMAGES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_PDF = ['application/pdf'];

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === 'pdf') cb(null, PDF_DIR);
    else if (file.fieldname === 'coverImage') cb(null, COVER_DIR);
    else cb(new AppError('حقل الملف غير مدعوم', 400));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '';
    cb(null, `${uuidv4()}${safeExt}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.fieldname === 'pdf') {
    if (path.extname(file.originalname).toLowerCase() !== '.pdf') {
      return cb(new AppError('يجب أن يكون الملف بصيغة PDF', 400));
    }
    if (file.mimetype !== 'application/pdf') {
      return cb(new AppError('نوع الملف غير مدعوم — PDF فقط', 400));
    }
  }

  if (file.fieldname === 'coverImage') {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      return cb(new AppError('صورة الغلاف يجب أن تكون jpg أو png أو webp', 400));
    }
    if (!ALLOWED_IMAGES.includes(file.mimetype)) {
      return cb(new AppError('نوع صورة الغلاف غير مدعوم', 400));
    }
  }

  cb(null, true);
};

export const uploadBookFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 2,
  },
}).fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]);

const imageFileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    return cb(new AppError('الصورة يجب أن تكون jpg أو png أو webp', 400));
  }
  if (!ALLOWED_IMAGES.includes(file.mimetype)) {
    return cb(new AppError('نوع الصورة غير مدعوم', 400));
  }
  cb(null, true);
};

export const uploadArticleCover = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single('coverImage');

const brandingStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, COVER_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
    cb(null, `${uuidv4()}${safeExt}`);
  },
});

export const uploadBrandingImages = multer({
  storage: brandingStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 3 * 1024 * 1024, files: 2 },
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'sheikhImage', maxCount: 1 },
]);

export const validateMagicBytes = async (req, _res, next) => {
  try {
    const checks = [];

    if (req.files?.pdf?.[0]) {
      checks.push({ file: req.files.pdf[0], allowed: ALLOWED_PDF, label: 'PDF' });
    }
    if (req.files?.coverImage?.[0]) {
      checks.push({ file: req.files.coverImage[0], allowed: ALLOWED_IMAGES, label: 'صورة' });
    }
    if (req.files?.logo?.[0]) {
      checks.push({ file: req.files.logo[0], allowed: ALLOWED_IMAGES, label: 'الشعار' });
    }
    if (req.files?.sheikhImage?.[0]) {
      checks.push({ file: req.files.sheikhImage[0], allowed: ALLOWED_IMAGES, label: 'صورة الشيخ' });
    }
    if (req.file) {
      checks.push({ file: req.file, allowed: ALLOWED_IMAGES, label: 'صورة' });
    }

    for (const { file, allowed, label } of checks) {
      const buffer = fs.readFileSync(file.path);
      const type = await fileTypeFromBuffer(buffer);

      if (!type || !allowed.includes(type.mime)) {
        fs.unlinkSync(file.path);
        return next(new AppError(`محتوى الملف (${label}) لا يطابق النوع المعلن`, 400));
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};

export const STORAGE_PATHS = { STORAGE_ROOT, PDF_DIR, COVER_DIR };
