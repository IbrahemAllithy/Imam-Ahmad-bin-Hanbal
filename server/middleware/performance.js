import logger from './logger.js';

/**
 * Query timeout middleware - يمنع الـ queries البطيئة من تعليق الخادم
 */
export const queryTimeout = (timeoutMs = 30000) => {
  return (req, res, next) => {
    // تطبيق timeout على كل query في هذا الـ request
    const originalQuery = req.app.locals.Query;
    if (originalQuery) {
      req.app.locals.Query = function (...args) {
        return originalQuery.apply(this, args).maxTimeMS(timeoutMs);
      };
    }
    next();
  };
};

/**
 * Request timeout middleware - يمنع الـ requests الطويلة
 */
export const requestTimeout = (timeoutMs = 60000) => {
  return (req, res, next) => {
    req.setTimeout(timeoutMs, () => {
      logger.warn('Request timeout', {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
      });
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          message: 'انتهى وقت الطلب — حاول مجدداً',
        });
      }
    });
    next();
  };
};

/**
 * Performance monitoring middleware
 */
export const performanceMonitor = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    // تسجيل الطلبات البطيئة
    if (duration > 3000) {
      logger.warn('Slow request detected', {
        url: req.originalUrl,
        method: req.method,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
        userId: req.user?._id,
      });
    }

    // تسجيل الأخطاء
    if (res.statusCode >= 500) {
      logger.error('Request failed with 5xx', {
        url: req.originalUrl,
        method: req.method,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    }
  });

  next();
};

export default { queryTimeout, requestTimeout, performanceMonitor };
