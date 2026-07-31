import mongoose from 'mongoose';

const saleBookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'العنوان طويل جداً'],
      default: 'كتاب جديد',
    },
    coverImage: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

saleBookSchema.index({ order: 1, createdAt: 1 });

const SaleBook = mongoose.model('SaleBook', saleBookSchema);

export default SaleBook;
