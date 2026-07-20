import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

const handleCastError = () => new AppError('المعرف غير صالح', 400);

const handleDuplicateKey = () => new AppError('البيانات مكررة', 400);

const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(messages.join(' — '), 400);
};

const handleJWTError = () => new AppError('رمز المصادقة غير صالح', 401);

const handleJWTExpired = () => new AppError('انتهت صلاحية الجلسة', 401);

export const notFound = (req, _res, next) => {
  next(new AppError(`المسار ${req.originalUrl} غير موجود`, 404));
};

export const errorHandler = (err, _req, res, _next) => {
  let error = { ...err, message: err.message, statusCode: err.statusCode };

  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new AppError('حجم الملف أكبر من المسموح', 400);
  }
  if (err.name === 'MulterError') {
    error = new AppError('خطأ في رفع الملف', 400);
  }
  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKey(err);
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpired();

  const statusCode = error.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  if (statusCode >= 500) {
    logger.error(error.message, { stack: err.stack });
  }

  res.status(statusCode).json({
    success: false,
    message: isProd && statusCode >= 500 ? 'حدث خطأ في الخادم' : error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
