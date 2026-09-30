/**
 * Enhanced Winston Logger - نظام logging احترافي
 */
import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize, errors } = format;

// تنسيق مخصص للـ logs
const customFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
  return `${timestamp} [${level}]: ${message} ${metaStr}`;
});

// إنشاء Logger محسّن
const winstonLogger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }), // معالجة stack traces
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  ),
  transports: [
    // Console transport للـ development
    new transports.Console({
      format: combine(colorize(), customFormat),
    }),
    // File transports للـ production
    ...(process.env.NODE_ENV === 'production'
      ? [
          new transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
          new transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880,
            maxFiles: 5,
          }),
        ]
      : []),
  ],
  // عدم إيقاف التطبيق عند حدوث خطأ في الـ logger
  exitOnError: false,
});

// Wrapper للتوافق مع الكود الحالي
export const logger = {
  info: (message, meta = {}) => winstonLogger.info(message, meta),
  warn: (message, meta = {}) => winstonLogger.warn(message, meta),
  error: (message, meta = {}) => winstonLogger.error(message, meta),
  debug: (message, meta = {}) => winstonLogger.debug(message, meta),
  security: (message, meta = {}) =>
    winstonLogger.warn(`[SECURITY] ${message}`, meta),
};

export default logger;
