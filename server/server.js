import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import { xssSanitize } from './utils/sanitize.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { STORAGE_PATHS } from './middleware/upload.js';
import logger from './utils/logger.js';

import authRoutes from './routes/authRoutes.js';
import lectureRoutes from './routes/lectureRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.disable('x-powered-by');

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://img.youtube.com', 'https://i.ytimg.com'],
        frameSrc: ["'self'", 'https://www.youtube.com'],
        connectSrc: ["'self'", CLIENT_URL],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());
app.use(xssSanitize);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.security('تجاوز الحد العام للطلبات', { ip: req.ip });
    res.status(429).json({
      success: false,
      message: 'تجاوزت عدد الطلبات المسموح — حاول بعد 15 دقيقة',
    });
  },
});
app.use('/api', globalLimiter);

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    skip: (req) => req.url === '/api/health',
  })
);

app.use(
  '/storage',
  express.static(STORAGE_PATHS.STORAGE_ROOT, {
    setHeaders: (res, filePath) => {
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      if (filePath.endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
      }
    },
  })
);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'الخادم يعمل' });
});

app.use('/api/auth', authRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`الخادم يعمل على المنفذ ${PORT}`);
    });
  } catch (err) {
    logger.error('فشل تشغيل الخادم', { error: err.message });
    process.exit(1);
  }
};

start();

export default app;
