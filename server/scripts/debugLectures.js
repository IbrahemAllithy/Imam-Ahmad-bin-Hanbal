import 'dotenv/config';
import connectDB from '../config/db.js';
import Lecture from '../models/Lecture.js';
import mongoose from 'mongoose';

await connectDB();
const now = new Date();
const all = await Lecture.find()
  .sort({ createdAt: -1 })
  .select('title series category order publishedAt createdAt')
  .limit(20);

console.log('NOW', now.toISOString());
console.log('TOTAL', await Lecture.countDocuments());

for (const l of all) {
  const pub = l.publishedAt;
  const visible = !pub || pub <= now;
  console.log({
    title: l.title,
    series: l.series,
    category: l.category,
    order: l.order,
    publishedAt: pub,
    visible,
  });
}

const series = await Lecture.distinct('series', { series: { $ne: '' } });
console.log('SERIES_ALL', series);

await mongoose.disconnect();
