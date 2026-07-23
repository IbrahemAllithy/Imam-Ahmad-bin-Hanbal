import mongoose from 'mongoose';

const lessonQuestionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lecture',
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: [true, 'السؤال مطلوب'],
      trim: true,
      maxlength: [2000, 'السؤال طويل جداً'],
    },
    status: {
      type: String,
      enum: ['pending', 'answered', 'closed'],
      default: 'pending',
      index: true,
    },
    adminReply: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: '',
    },
  },
  { timestamps: true }
);

const LessonQuestion = mongoose.model('LessonQuestion', lessonQuestionSchema);
export default LessonQuestion;
