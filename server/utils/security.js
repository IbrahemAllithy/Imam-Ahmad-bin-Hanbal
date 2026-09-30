/**
 * Security utilities - مساعدات أمنية إضافية
 */

/**
 * تنظيف البيانات من SQL injection patterns
 */
export const sanitizeSql = (input) => {
  if (typeof input !== 'string') return input;
  // إزالة كلمات SQL الخطرة
  const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi;
  return input.replace(sqlPatterns, '');
};

/**
 * التحقق من صحة ObjectId دون استخدام mongoose
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * تحديد IP الحقيقي للمستخدم (خلف proxy)
 */
export const getRealIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

/**
 * التحقق من User Agent مشبوه
 */
export const isSuspiciousUserAgent = (userAgent) => {
  if (!userAgent) return true;
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java(?!script)/i,
  ];
  return suspiciousPatterns.some((pattern) => pattern.test(userAgent));
};

/**
 * تحديد حد upload آمن بناءً على نوع الملف
 */
export const getMaxFileSize = (mimetype) => {
  const limits = {
    'application/pdf': 50 * 1024 * 1024, // 50MB للـ PDFs
    'image/jpeg': 5 * 1024 * 1024, // 5MB للصور
    'image/png': 5 * 1024 * 1024,
    'image/webp': 5 * 1024 * 1024,
    'audio/mpeg': 20 * 1024 * 1024, // 20MB للصوتيات
    'audio/mp3': 20 * 1024 * 1024,
  };
  return limits[mimetype] || 10 * 1024 * 1024; // 10MB default
};

/**
 * تنظيف اسم الملف من أحرف خطرة
 */
export const sanitizeFilename = (filename) => {
  if (!filename) return 'file';
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+/, '')
    .slice(0, 255);
};

/**
 * التحقق من صحة URL
 */
export const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Rate limit key generator - مفتاح فريد لكل مستخدم/IP
 */
export const rateLimitKeyGenerator = (req) => {
  // إذا كان مسجل دخول، استخدم user ID
  if (req.user?._id) {
    return `user:${req.user._id}`;
  }
  // وإلا استخدم IP
  return `ip:${getRealIp(req)}`;
};

export default {
  sanitizeSql,
  isValidObjectId,
  getRealIp,
  isSuspiciousUserAgent,
  getMaxFileSize,
  sanitizeFilename,
  isValidUrl,
  rateLimitKeyGenerator,
};
