import 'dotenv/config';
import mongoose from 'mongoose';
import Lecture from '../models/Lecture.js';

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const lectures = await Lecture.find({});
  console.log('TOTAL LECTURES IN DB:', lectures.length);
  lectures.forEach((l) => {
    console.log(`ID: ${l._id} | Category: "${l.category}" | Series: "${l.series}" | Title: "${l.title}"`);
  });
  await mongoose.disconnect();
};

run();
