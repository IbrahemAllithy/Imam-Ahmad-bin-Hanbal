import Progress from '../models/Progress.js';
import Lecture from '../models/Lecture.js';
import Certificate from '../models/Certificate.js';
import AppError from '../utils/AppError.js';

const maybeIssueCertificate = async (userId, series) => {
  if (!series) return null;

  const lessons = await Lecture.find({
    series,
    $or: [{ publishedAt: { $lte: new Date() } }, { publishedAt: null }],
  }).select('_id');

  if (!lessons.length) return null;

  const completed = await Progress.countDocuments({
    user: userId,
    lecture: { $in: lessons.map((l) => l._id) },
  });

  if (completed < lessons.length) return null;

  let cert = await Certificate.findOne({ user: userId, series });
  if (cert) return cert;

  cert = await Certificate.create({
    user: userId,
    series,
    code: Certificate.generateCode(),
  });

  try {
    const { default: Notification } = await import('../models/Notification.js');
    await Notification.create({
      user: userId,
      type: 'certificate',
      title: 'مبروك! حصلت على شهادة',
      body: `أكملت دورة «${series}» بنجاح.`,
      link: `/certificates/${cert._id}`,
    });
  } catch {
    // non-blocking
  }

  return cert;
};

export const getMyProgress = async (req, res, next) => {
  try {
    const { series } = req.query;
    const filter = { user: req.user._id };
    if (series) filter.series = series;

    const items = await Progress.find(filter)
      .populate('lecture', 'title series category order')
      .sort({ completedAt: -1 });

    res.json({
      success: true,
      data: items,
      completedIds: items.map((p) => String(p.lecture?._id || p.lecture)),
    });
  } catch (err) {
    next(err);
  }
};

export const gradeQuiz = async (req, res, next) => {
  try {
    const { lectureId, answers } = req.body;
    if (!lectureId) return next(new AppError('معرّف الدرس مطلوب', 400));
    if (!Array.isArray(answers)) return next(new AppError('الإجابات مطلوبة', 400));

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) return next(new AppError('الدرس غير موجود', 404));

    const items = lecture.quizItems || [];
    if (!items.length) {
      return next(new AppError('لا يوجد اختبار متعدد الخيارات لهذا الدرس', 400));
    }

    let correct = 0;
    const results = items.map((item, idx) => {
      const selected = Number(answers[idx]);
      const isCorrect = selected === item.correctIndex;
      if (isCorrect) correct += 1;
      return {
        index: idx,
        selected: Number.isFinite(selected) ? selected : null,
        correct: isCorrect,
        correctIndex: item.correctIndex,
      };
    });

    const score = Math.round((correct / items.length) * 100);

    res.json({
      success: true,
      data: {
        score,
        correct,
        total: items.length,
        results,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const markComplete = async (req, res, next) => {
  try {
    const { lectureId, quizScore } = req.body;
    if (!lectureId) return next(new AppError('معرّف الدرس مطلوب', 400));

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) return next(new AppError('الدرس غير موجود', 404));

    const update = {
      series: lecture.series || '',
      completedAt: new Date(),
    };
    if (quizScore !== undefined && quizScore !== null) {
      update.quizScore = Number(quizScore);
    }

    const progress = await Progress.findOneAndUpdate(
      { user: req.user._id, lecture: lectureId },
      { $set: update, $setOnInsert: { user: req.user._id, lecture: lectureId } },
      { upsert: true, new: true, runValidators: true }
    );

    const certificate = await maybeIssueCertificate(req.user._id, lecture.series);

    res.json({
      success: true,
      data: progress,
      certificate: certificate
        ? { id: certificate._id, series: certificate.series, code: certificate.code }
        : null,
    });
  } catch (err) {
    next(err);
  }
};

export const unmarkComplete = async (req, res, next) => {
  try {
    const progress = await Progress.findOneAndDelete({
      user: req.user._id,
      lecture: req.params.id,
    });
    if (!progress) return next(new AppError('سجل التقدم غير موجود', 404));
    res.json({ success: true, message: 'تم إلغاء إكمال الدرس' });
  } catch (err) {
    next(err);
  }
};

export const syncLocalProgress = async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body.lectureIds) ? req.body.lectureIds : [];
    if (!ids.length) {
      return res.json({ success: true, data: [], synced: 0 });
    }

    const lectures = await Lecture.find({ _id: { $in: ids } });
    let synced = 0;
    for (const lecture of lectures) {
      await Progress.findOneAndUpdate(
        { user: req.user._id, lecture: lecture._id },
        {
          $set: { series: lecture.series || '', completedAt: new Date() },
          $setOnInsert: { user: req.user._id, lecture: lecture._id },
        },
        { upsert: true }
      );
      synced += 1;
      await maybeIssueCertificate(req.user._id, lecture.series);
    }

    const items = await Progress.find({ user: req.user._id });
    res.json({
      success: true,
      synced,
      completedIds: items.map((p) => String(p.lecture)),
    });
  } catch (err) {
    next(err);
  }
};
