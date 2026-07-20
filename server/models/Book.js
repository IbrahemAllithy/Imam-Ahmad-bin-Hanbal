import mongoose from 'mongoose';

const CATEGORIES = ['عقيدة', 'فقه', 'تفسير', 'حديث', 'سيرة', 'آداب', 'عام'];

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'عنوان الكتاب مطلوب'],
      trim: true,
      maxlength: [200, 'العنوان طويل جداً'],
    },
    author: {
      type: String,
      required: [true, 'اسم المؤلف مطلوب'],
      trim: true,
      maxlength: [150, 'اسم المؤلف طويل جداً'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'الوصف طويل جداً'],
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    pdfUrl: {
      type: String,
      required: [true, 'ملف PDF مطلوب'],
    },
    pages: {
      type: Number,
      min: [1, 'عدد الصفحات يجب أن يكون 1 على الأقل'],
      default: 1,
    },
    category: {
      type: String,
      enum: CATEGORIES,
      default: 'عام',
    },
  },
  { timestamps: true }
);

bookSchema.index({ category: 1, createdAt: -1 });

const Book = mongoose.model('Book', bookSchema);

export { CATEGORIES as BOOK_CATEGORIES };
export default Book;
