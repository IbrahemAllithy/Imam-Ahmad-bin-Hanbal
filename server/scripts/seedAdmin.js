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

  const email = ADMIN_EMAIL.toLowerCase().trim();
  let admin = await User.findOne({ email }).select('+password');

  if (admin) {
    admin.name = ADMIN_NAME || admin.name || 'مدير الموقع';
    admin.role = 'admin';
    admin.isEmailVerified = true;
    admin.password = ADMIN_PASSWORD; // pre-save hook hashes it
    admin.failedLoginAttempts = 0;
    admin.lockUntil = undefined;
    await admin.save();
    console.log('✅ تم تحديث حساب الأدمن وكلمة المرور من .env');
  } else {
    await User.create({
      name: ADMIN_NAME || 'مدير الموقع',
      email,
      password: ADMIN_PASSWORD,
      role: 'admin',
      isEmailVerified: true,
    });
    console.log('✅ تم إنشاء حساب الأدمن بنجاح');
  }

  await mongoose.disconnect();
};

seedAdmin().catch((err) => {
  console.error('❌ خطأ:', err.message);
  process.exit(1);
});
