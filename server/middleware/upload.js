import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { fileTypeFromBuffer } from 'file-type';
import AppError from '../utils/AppError.js';
import { R2_ENABLED, uploadBufferToR2, deleteFromR2ByUrl } from '../config/r2.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_ROOT = path.join(__dirname, '..', 'storage');
const PDF_DIR = path.join(STORAGE_ROOT, 'pdfs');
const COVER_DIR = path.join(STORAGE_ROOT, 'covers');
const VIDEO_DIR = path.join(STORAGE_ROOT, 'videos');

[STORAGE_ROOT, PDF_DIR, COVER_DIR, VIDEO_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const ALLOWED_IMAGES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_PDF = ['application/pdf'];
const ALLOWED_VIDEOS = ['video/mp4', 'video/webm', 'video/quicktime'];
const VIDEO_EXTS = ['.mp4', '.webm', '.mov'];

// Files uploaded via a field named "pdf" go to R2's pdfs/ prefix (or local PDF_DIR); a field
// named "video" goes to videos/ (or local VIDEO_DIR); every other upload field is treated as
// an image and goes to covers/ (or local COVER_DIR).
const R2_FOLDER = { pdf: 'pdfs', video: 'videos' };
const folderFor = (fieldname) => R2_FOLDER[fieldname] || 'covers';

// R2 configured (production): keep files in memory, upload to the bucket in uploadFilesToR2.
// R2 not configured (local dev without cloud credentials): fall back to the local disk, exactly
// as before — /storage is gitignored and not guaranteed to survive a redeploy, so this path is
// for local development only.
const diskStorage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === 'pdf') cb(null, PDF_DIR);
    else if (file.fieldname === 'video') cb(null, VIDEO_DIR);
    else cb(null, COVER_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', ...VIDEO_EXTS].includes(ext) ? ext : '';
    cb(null, `${uuidv4()}${safeExt}`);
  },
});

const storage = R2_ENABLED ? multer.memoryStorage() : diskStorage;

const fileFilter = (_req, file, cb) => {
  if (file.fieldname === 'pdf') {
    if (path.extname(file.originalname).toLowerCase() !== '.pdf') {
      return cb(new AppError('يجب أن يكون الملف بصيغة PDF', 400));
    }
    if (file.mimetype !== 'application/pdf') {
      return cb(new AppError('نوع الملف غير مدعوم — PDF فقط', 400));
    }
  } else if (file.fieldname === 'video') {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!VIDEO_EXTS.includes(ext)) {
      return cb(new AppError('الفيديو يجب أن يكون mp4 أو webm أو mov', 400));
    }
    if (!ALLOWED_VIDEOS.includes(file.mimetype)) {
      return cb(new AppError('نوع الفيديو غير مدعوم', 400));
    }
  } else {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      return cb(new AppError('الصورة يجب أن تكون jpg أو png أو webp', 400));
    }
    if (!ALLOWED_IMAGES.includes(file.mimetype)) {
      return cb(new AppError('نوع الصورة غير مدعوم', 400));
    }
  }
  cb(null, true);
};

export const uploadBookFiles = multer({
  storage,
  fileFilter,
  limits: {
    // Scanned Arabic books routinely exceed 25MB.
    fileSize: 50 * 1024 * 1024,
    files: 2,
  },
}).fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]);

export const uploadArticleCover = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single('coverImage');

export const uploadSaleBookCover = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('coverImage');

export const uploadEventCover = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('coverImage');

export const uploadTestimonialPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 },
}).single('photo');

export const uploadTestimonialMedia = multer({
  storage,
  fileFilter,
  // Shared limit covers both fields; a testimonial video needs much more room than the photo.
  limits: { fileSize: 80 * 1024 * 1024, files: 2 },
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

export const uploadBrandingImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024, files: 2 },
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'sheikhImage', maxCount: 1 },
]);

const allFiles = (req) => (req.file ? [req.file] : Object.values(req.files || {}).flat());

export const validateMagicBytes = async (req, _res, next) => {
  try {
    for (const file of allFiles(req)) {
      const allowed =
        file.fieldname === 'pdf' ? ALLOWED_PDF : file.fieldname === 'video' ? ALLOWED_VIDEOS : ALLOWED_IMAGES;
      const label = file.fieldname === 'pdf' ? 'PDF' : file.fieldname === 'video' ? 'الفيديو' : 'صورة';
      const buffer = file.buffer || (await fs.promises.readFile(file.path));
      const type = await fileTypeFromBuffer(buffer);

      if (!type || !allowed.includes(type.mime)) {
        await removeUploadedFiles(req);
        return next(new AppError(`محتوى الملف (${label}) لا يطابق النوع المعلن`, 400));
      }
    }
    next();
  } catch (err) {
    await removeUploadedFiles(req);
    next(err);
  }
};

/**
 * Uploads every parsed file to R2 (when configured) and stamps each with a `publicUrl` —
 * controllers read `file.publicUrl` uniformly regardless of which storage backend is active.
 * In local-disk mode, `publicUrl` is just the existing `/storage/<folder>/<filename>` path.
 */
export const uploadFilesToR2 = async (req, _res, next) => {
  try {
    for (const file of allFiles(req)) {
      if (R2_ENABLED) {
        const ext = path.extname(file.originalname).toLowerCase();
        const safeExt = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', ...VIDEO_EXTS].includes(ext) ? ext : '';
        const key = `${folderFor(file.fieldname)}/${uuidv4()}${safeExt}`;
        file.publicUrl = await uploadBufferToR2(key, file.buffer, file.mimetype);
      } else {
        file.publicUrl = `/storage/${folderFor(file.fieldname)}/${file.filename}`;
      }
    }
    next();
  } catch (err) {
    await removeUploadedFiles(req);
    next(err);
  }
};

/** Cleans up every file this request wrote — R2 objects when in cloud mode, local files otherwise. */
export const removeUploadedFiles = async (req) => {
  const files = allFiles(req);
  await Promise.all(
    files.map(async (file) => {
      if (file.publicUrl && R2_ENABLED) {
        await deleteFromR2ByUrl(file.publicUrl);
      } else if (file.path) {
        await fs.promises.unlink(file.path).catch(() => {
          // already removed or never written — nothing to clean up
        });
      }
    })
  );
};

export const STORAGE_PATHS = { STORAGE_ROOT, PDF_DIR, COVER_DIR, VIDEO_DIR };
