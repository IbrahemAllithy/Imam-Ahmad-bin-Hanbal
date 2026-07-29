import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'اسم القائل مطلوب'],
      trim: true,
      maxlength: [150, 'الاسم طويل جداً'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'الصفة/الوصف طويل جداً'],
      default: '',
    },
    quote: {
      type: String,
      required: [true, 'نص الشهادة مطلوب'],
      trim: true,
      maxlength: [2000, 'النص طويل جداً'],
    },
    photo: {
      type: String,
      default: '',
    },
    video: {
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

testimonialSchema.index({ order: 1, createdAt: -1 });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;
