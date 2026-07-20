import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'الاسم مطلوب'],
      trim: true,
      maxlength: [100, 'الاسم طويل جداً'],
    },
    email: {
      type: String,
      required: [true, 'البريد الإلكتروني مطلوب'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'صيغة البريد الإلكتروني غير صحيحة'],
    },
    password: {
      type: String,
      required: [true, 'كلمة المرور مطلوبة'],
      minlength: [8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.virtual('isLocked').get(function isLocked() {
  return this.lockUntil && this.lockUntil > Date.now();
});

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.incrementFailedAttempts = async function incrementFailedAttempts() {
  this.failedLoginAttempts += 1;
  if (this.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
    this.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
  }
  await this.save({ validateBeforeSave: false });
};

userSchema.methods.resetFailedAttempts = async function resetFailedAttempts() {
  if (this.failedLoginAttempts === 0 && !this.lockUntil) return;
  this.failedLoginAttempts = 0;
  this.lockUntil = null;
  await this.save({ validateBeforeSave: false });
};

const User = mongoose.model('User', userSchema);

export default User;
