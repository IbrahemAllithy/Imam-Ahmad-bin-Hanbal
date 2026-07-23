import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI غير معرّف في ملف البيئة');
  }

  await mongoose.connect(uri);
  logger.info('MongoDB متصل بنجاح');
};

export default connectDB;
