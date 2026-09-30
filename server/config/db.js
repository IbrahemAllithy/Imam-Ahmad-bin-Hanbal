import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI غير معرّف في ملف البيئة');
  }

  // إعدادات محسّنة للأداء والموثوقية
  const options = {
    maxPoolSize: 10, // عدد الاتصالات المتزامنة
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000, // 5 ثوان timeout
    socketTimeoutMS: 45000, // 45 ثانية للـ operations الطويلة
    family: 4, // استخدام IPv4 فقط (أسرع في بعض البيئات)
  };

  await mongoose.connect(uri, options);
  logger.info('MongoDB متصل بنجاح');

  // Monitoring للاتصال
  mongoose.connection.on('error', (err) => {
    logger.error('خطأ في اتصال MongoDB', { error: err.message });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB انقطع الاتصال');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB أعيد الاتصال');
  });
};

export default connectDB;
