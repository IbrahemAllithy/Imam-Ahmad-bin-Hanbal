import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI غير معرّف في ملف البيئة');
  }

  await mongoose.connect(uri);
  console.log('✅ MongoDB متصل');
};

export default connectDB;
