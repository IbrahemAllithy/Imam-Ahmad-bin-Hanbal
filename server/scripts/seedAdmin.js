import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/db.js';

const seedAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('❌ ADMIN_EMAIL و ADMIN_PASSWORD مطلوبان في .env');
    process.exit(1);
  }

  await connectDB();

  const exists = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (exists) {
    console.log('ℹ️  حساب الأدمن موجود مسبقاً');
    await mongoose.disconnect();
    return;
  }

  await User.create({
    name: ADMIN_NAME || 'مدير الموقع',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
    isEmailVerified: true,
  });

  console.log('✅ تم إنشاء حساب الأدمن بنجاح');
  await mongoose.disconnect();
};

seedAdmin().catch((err) => {
  console.error('❌ خطأ:', err.message);
  process.exit(1);
});
