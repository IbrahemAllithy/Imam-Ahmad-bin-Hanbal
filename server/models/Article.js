import mongoose from 'mongoose';

const CATEGORIES = ['عقيدة', 'فقه', 'تفسير', 'حديث', 'سيرة', 'آداب', 'عام'];

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'عنوان المقال مطلوب'],
      trim: true,
      maxlength: [200, 'العنوان طويل جداً'],
    },
    content: {
      type: String,
      required: [true, 'محتوى المقال مطلوب'],
      maxlength: [50000, 'المحتوى طويل جداً'],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [500, 'المقتطف طويل جداً'],
      default: '',
    },
    category: {
      type: String,
      enum: CATEGORIES,
      default: 'عام',
    },
    coverImage: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

articleSchema.index({ category: 1, createdAt: -1 });
articleSchema.index({ title: 'text', content: 'text' });

const Article = mongoose.model('Article', articleSchema);

export { CATEGORIES as ARTICLE_CATEGORIES };
export default Article;
