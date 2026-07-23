import mongoose from 'mongoose';
import crypto from 'crypto';

const certificateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    series: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

certificateSchema.index({ user: 1, series: 1 }, { unique: true });

certificateSchema.statics.generateCode = function generateCode() {
  return `IAH-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

const Certificate = mongoose.model('Certificate', certificateSchema);
export default Certificate;
