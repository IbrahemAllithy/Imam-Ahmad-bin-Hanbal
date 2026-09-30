import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// تحميل متغيرات البيئة للاختبارات
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.test') });

let mongoServer;

// إعداد قاعدة البيانات قبل جميع الاختبارات
beforeAll(async () => {
  // إنشاء MongoDB في الذاكرة للاختبارات
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // إغلاق أي اتصال موجود
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // الاتصال بقاعدة البيانات التجريبية
  await mongoose.connect(mongoUri);
});

// تنظيف قاعدة البيانات بعد كل اختبار
afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

// إغلاق الاتصال بعد جميع الاختبارات
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// تعطيل console.log/warn/error أثناء الاختبارات
const noop = () => {};
global.console = {
  ...console,
  log: noop,
  warn: noop,
  error: noop,
};
