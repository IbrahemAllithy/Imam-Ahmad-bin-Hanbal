import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const handleCastError = (err) => {
  const field = err.path || 'id';
  return new AppError(`المعرف ${field} غير صالح`, 400);
};

const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyPattern || {})[0] || 'field';
  const fieldAr = field === 'email' ? 'البريد الإلكتروني' : field;
  return new AppError(`${fieldAr} مستخدم بالفعل`, 400, field);
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  const field = Object.keys(err.errors)[0] || null;
  return new AppError(messages.join(' — '), 400, field);
};

const handleJWTError = () => new AppError('رمز المصادقة غير صالح', 401);

const handleJWTExpired = () => new AppError('انتهت صلاحية الجلسة', 401);

export const notFound = (req, _res, next) => {
  next(new AppError(`المسار ${req.originalUrl} غير موجود`, 404));
};

export const errorHandler = (err, req, res, _next) => {
  let error = { ...err, message: err.message, statusCode: err.statusCode };

  // Fallback only — the upload middleware normally reports the field and its real limit.
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new AppError('حجم الملف أكبر من الحد المسموح به', 400);
  }
  if (err.name === 'MulterError') {
    const msg = err.field ? `خطأ في رفع الملف: ${err.field}` : 'خطأ في رفع الملف';
    error = new AppError(msg, 400);
  }
  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKey(err);
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpired();

  const statusCode = error.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  // Logging محسّن مع context
  if (statusCode >= 500) {
    logger.error(error.message, {
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.user?._id,
    });
  } else if (statusCode === 401 || statusCode === 403) {
    logger.security(`${statusCode} - ${error.message}`, {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  }

  res.status(statusCode).json({
    success: false,
    message: isProd && statusCode >= 500 ? 'حدث خطأ في الخادم' : error.message,
    ...(error.field || err.field ? { field: error.field || err.field } : {}),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err.name,
    }),
  });
};
