import mongoose from 'mongoose';

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
      maxlength: [150, 'اسم السلسلة طويل جداً'],
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: 'عام',
    },
  },
  { timestamps: true }
);

lectureSchema.index({ category: 1, createdAt: -1 });
lectureSchema.index({ series: 1 });

const Lecture = mongoose.model('Lecture', lectureSchema);

export default Lecture;
