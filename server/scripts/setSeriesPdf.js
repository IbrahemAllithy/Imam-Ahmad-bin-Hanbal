import 'dotenv/config';
import mongoose from 'mongoose';
import Lecture from '../models/Lecture.js';
import { escapeRegex } from '../utils/sanitize.js';

/**
 * Points every lesson of a series at one book PDF.
 *
 *   node scripts/setSeriesPdf.js "نجاة الخلف" "https://pub-xxxx.r2.dev/pdfs/....pdf"
 *
 * The series argument is matched as a substring of the lecture's `series` field, so a
 * distinctive part of the name is enough. Pass --dry to preview without writing.
 */
const args = process.argv.slice(2);
const dryRun = args.includes('--dry');
const [seriesQuery, pdfUrl] = args.filter((a) => a !== '--dry');

if (!seriesQuery || (!pdfUrl && !dryRun)) {
  console.error('Usage: node scripts/setSeriesPdf.js "<series>" "<pdfUrl>" [--dry]');
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const filter = { series: { $regex: escapeRegex(seriesQuery), $options: 'i' } };
  const lectures = await Lecture.find(filter).sort({ order: 1 }).lean();

  if (!lectures.length) {
    console.error(`No lectures found for a series matching "${seriesQuery}"`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`Series: "${lectures[0].series}" — ${lectures.length} lesson(s)`);
  lectures.forEach((l) => console.log(`  ${l.order}. ${l.title}\n     old: ${l.pdfUrl || '(none)'}`));

  if (dryRun) {
    console.log('\n--dry: nothing written.');
  } else {
    const result = await Lecture.updateMany(filter, { $set: { pdfUrl } });
    console.log(`\nUpdated ${result.modifiedCount} lesson(s) to:\n  ${pdfUrl}`);
  }

  await mongoose.disconnect();
};

run();
