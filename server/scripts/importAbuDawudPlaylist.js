import 'dotenv/config';
import fs from 'fs';
import mongoose from 'mongoose';
import Lecture from '../models/Lecture.js';
import { notifyAllStudents } from '../controllers/notificationController.js';

const SERIES = 'سنن أبي داود';
const CATEGORY = 'الحديث';
const PLAYLIST_ID = 'PLzgycZElueFjEi_wdWoEYhU0_qBlSCXTB';

const truncate = (s, max = 200) => {
  const t = String(s || '').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
};

const lessonTitle = (index, ytTitle) => {
  const cleaned = String(ytTitle || '')
    .replace(/\s+/g, ' ')
    .trim();
  // Prefer short stable titles for UI; keep YouTube wording in description
  return truncate(`شرح سنن أبي داود — المجلس ${index}`);
};

const run = async () => {
  const file = new URL('./playlist-videos.json', import.meta.url);
  const videos = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(videos) || !videos.length) {
    throw new Error('playlist-videos.json فارغ أو غير موجود');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ متصل بقاعدة البيانات');
  console.log(`📦 عدد فيديوهات القائمة: ${videos.length}`);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const now = new Date();

  for (const v of videos) {
    const youtubeId = v.id;
    const order = Number(v.index) || 0;
    const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeId}&list=${PLAYLIST_ID}`;
    const title = lessonTitle(order, v.title);
    const description = truncate(
      `المجلس ${order} من سلسلة التعليق على سنن أبي داود لفضيلة الشيخ شعبان العودة.\n\nالعنوان على يوتيوب: ${v.title}`,
      5000
    );

    const existing = await Lecture.findOne({
      $or: [{ youtubeId, series: SERIES }, { youtubeId, category: CATEGORY }],
    });

    if (existing) {
      const needsUpdate =
        existing.series !== SERIES ||
        existing.category !== CATEGORY ||
        existing.order !== order ||
        !existing.publishedAt ||
        existing.publishedAt > now;

      if (needsUpdate) {
        existing.series = SERIES;
        existing.category = CATEGORY;
        existing.order = order;
        existing.youtubeUrl = youtubeUrl;
        if (!existing.description) existing.description = description;
        if (!existing.publishedAt || existing.publishedAt > now) {
          existing.publishedAt = now;
        }
        await existing.save();
        updated += 1;
        console.log(`♻️ تحديث: ${order} — ${existing.title}`);
      } else {
        skipped += 1;
      }
      continue;
    }

    await Lecture.create({
      title,
      youtubeUrl,
      youtubeId,
      category: CATEGORY,
      series: SERIES,
      description,
      order,
      publishedAt: now,
      quizQuestions: [],
      quizItems: [],
    });
    created += 1;
    console.log(`➕ إضافة: ${order} — ${title}`);
  }

  const total = await Lecture.countDocuments({ series: SERIES });
  console.log('\n——— النتيجة ———');
  console.log(`مضاف: ${created} | محدّث: ${updated} | متخطّى: ${skipped}`);
  console.log(`إجمالي دروس السلسلة في قاعدة البيانات: ${total}`);

  if (created > 0) {
    const notifyResult = await notifyAllStudents({
      type: 'lecture',
      title: `سلسلة جديدة: ${SERIES}`,
      body: `تم نشر سلسلة (${SERIES}) في قسم الحديث — ${total} مجلساً.`,
      link: `/courses/${encodeURIComponent(SERIES)}`,
    });
    console.log('✅ إشعار واحد للطلاب:', notifyResult);
  }

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('❌ فشل الاستيراد:', err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
