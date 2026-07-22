import mongoose from 'mongoose';

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
  'عام'
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
      enum: CATEGORIES,
      trim: true,
      default: 'عام',
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
    quizQuestions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

lectureSchema.index({ category: 1, createdAt: -1 });
lectureSchema.index({ series: 1 });

const Lecture = mongoose.model('Lecture', lectureSchema);

export { CATEGORIES as LECTURE_CATEGORIES };
export default Lecture;
