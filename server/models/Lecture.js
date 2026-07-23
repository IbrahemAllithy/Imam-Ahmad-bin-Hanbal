import mongoose from 'mongoose';

const quizItemSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: 500 },
    options: {
      type: [String],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 2 && arr.length <= 6,
        message: 'يجب توفير خيارين إلى ستة خيارات',
      },
    },
    correctIndex: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const CATEGORIES = [
  'العقيدة',
  'الفقه',
  'أصول فقه',
  'التفسير',
  'الحديث',
  'السيرة',
  'آداب طالب العلم',
  'الرقائق',
  'علوم قرآن',
  'مصطلح حديث',
  'عقيدة',
  'فقه',
  'تفسير',
  'حديث',
  'سيرة',
  'آداب',
  'عام',
];

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'عنوان المحاضرة مطلوب'],
      trim: true,
      maxlength: [200, 'العنوان طويل جداً'],
    },
    youtubeUrl: {
      type: String,
      required: [true, 'رابط اليوتيوب مطلوب'],
    },
    youtubeId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'الوصف طويل جداً'],
      default: '',
    },
    series: {
      type: String,
      trim: true,
      maxlength: [150, 'اسم الكتاب أو السلسلة طويل جداً'],
      default: '',
    },
    category: {
      type: String,
      trim: true,
      maxlength: [100, 'التصنيف طويل جداً'],
      default: 'عام',
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    pdfUrl: {
      type: String,
      trim: true,
      default: '',
    },
    audioUrl: {
      type: String,
      trim: true,
      default: '',
    },
    /** Legacy open questions (display only) */
    quizQuestions: {
      type: [String],
      default: [],
    },
    /** MCQ items with scoring */
    quizItems: {
      type: [quizItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

lectureSchema.index({ category: 1, createdAt: -1 });
lectureSchema.index({ series: 1, order: 1 });

const Lecture = mongoose.model('Lecture', lectureSchema);

export { CATEGORIES as LECTURE_CATEGORIES };
export default Lecture;
