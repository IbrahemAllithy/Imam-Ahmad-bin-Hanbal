import 'dotenv/config';
import connectDB from '../config/db.js';
import Lecture from '../models/Lecture.js';
import Article from '../models/Article.js';
import Book from '../models/Book.js';
import mongoose from 'mongoose';

await connectDB();
const now = new Date();

const lectureResult = await Lecture.updateMany(
  { publishedAt: { $gt: now } },
  { $set: { publishedAt: now } }
);
const articleResult = await Article.updateMany(
  { publishedAt: { $gt: now } },
  { $set: { publishedAt: now } }
);
const bookResult = await Book.updateMany(
  { publishedAt: { $gt: now } },
  { $set: { publishedAt: now } }
);

console.log('fixed lectures', lectureResult.modifiedCount);
console.log('fixed articles', articleResult.modifiedCount);
console.log('fixed books', bookResult.modifiedCount);

const series = await Lecture.find().select('title series category publishedAt');
for (const l of series) {
  console.log({
    title: l.title,
    series: l.series || '(empty)',
    category: l.category,
    publishedAt: l.publishedAt,
  });
}

await mongoose.disconnect();
