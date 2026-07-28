import 'dotenv/config';
import mongoose from 'mongoose';
import Event from '../models/Event.js';

// Cover files are checked into the repo (server/seed/gallery), served via
// the /seed-gallery static route — unlike /storage, which is gitignored and
// not guaranteed to survive a redeploy. These have no eventDate: they're
// undated photos from the معهد's activity albums.
const GALLERY = [
  { file: 'gallery-01.jpeg', title: 'بعض دورات براعم' },
  { file: 'gallery-02.jpeg', title: 'حفل افتتاح مقرأة السنة بمجمع أحمد بن حنبل' },
  { file: 'gallery-03.jpeg', title: 'حفل ختام دورة محدث' },
  { file: 'gallery-04.jpeg', title: 'حفل ختام مختصر مسلم للمنذري بمسجد القبطان' },
  { file: 'gallery-05.jpeg', title: 'ختام بعض الدورات العلمية' },
  { file: 'gallery-06.jpeg', title: 'ختام بعض الدورات العلمية بمجمع أحمد بن حنبل' },
  { file: 'gallery-07.jpeg', title: 'ختم دورة فقيه' },
  { file: 'gallery-08.jpeg', title: 'ختم صحيح البخاري (مقرأة السنة)' },
  { file: 'gallery-09.jpeg', title: 'دورة كتاب (المنجيات) ببيت جالية (إندونيسيا) بمدينة نصر' },
  { file: 'gallery-10.jpeg', title: 'لقاء دعوي حضر فيه الشيخ مطلق الجاسر حفظه الله' },
];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ متصل بقاعدة البيانات');

  let created = 0;
  let skipped = 0;

  for (const { file, title } of GALLERY) {
    const existing = await Event.findOne({ coverImage: `/seed-gallery/${file}` });
    if (existing) {
      skipped += 1;
      continue;
    }
    await Event.create({
      title,
      coverImage: `/seed-gallery/${file}`,
    });
    created += 1;
    console.log(`➕ ${title}`);
  }

  console.log(`\nمضاف: ${created} | متخطّى (موجود مسبقاً): ${skipped}`);
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
