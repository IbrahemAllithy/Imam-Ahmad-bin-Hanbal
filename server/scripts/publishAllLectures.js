import 'dotenv/config';
import connectDB from '../config/db.js';
import Lecture from '../models/Lecture.js';
import mongoose from 'mongoose';

await connectDB();
const now = new Date();
const result = await Lecture.updateMany({}, { $set: { publishedAt: now } });
console.log('published all lectures now:', result.modifiedCount);

const list = await Lecture.find().select('title series category publishedAt');
for (const l of list) {
  console.log({
    title: l.title,
    series: l.series || '(empty)',
    category: l.category,
    visible: !l.publishedAt || l.publishedAt <= new Date(Date.now() + 120000),
  });
}
await mongoose.disconnect();
