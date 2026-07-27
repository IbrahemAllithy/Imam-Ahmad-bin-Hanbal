import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'عنوان الفعالية مطلوب'],
      trim: true,
      maxlength: [200, 'العنوان طويل جداً'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [3000, 'الوصف طويل جداً'],
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    eventDate: {
      type: Date,
      required: [true, 'تاريخ الفعالية مطلوب'],
    },
  },
  { timestamps: true }
);

eventSchema.index({ eventDate: -1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
