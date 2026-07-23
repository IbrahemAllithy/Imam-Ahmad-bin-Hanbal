import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
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
    series: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    quizScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, lecture: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);
export default Progress;
