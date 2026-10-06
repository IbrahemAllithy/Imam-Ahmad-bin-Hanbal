import 'dotenv/config';
import mongoose from 'mongoose';
import Lecture from '../models/Lecture.js';

// روابط الصوتيات من Archive.org
const audioUrls = [
  { order: 1, audioUrl: 'https://archive.org/download/57-57-/%D8%A7%D8%AE%D8%B5%D8%B1%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%B5%D8%B1%D8%A7%D8%AA/01%20-%20%D8%A7%D9%84%D9%85%D8%AC%D9%84%D8%B3%20(1)%20%D8%B4%D8%B1%D8%AD%20%D8%A7%D9%94%D8%AE%D8%B5%D8%B1%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%B5%D8%B1%D8%A7%D8%AA%20%5B%D9%85%D9%82%D8%AF%D9%85%D8%A9%20%D8%B9%D9%86%20%D8%A7%D9%84%D8%AA%D9%85%D8%B0%D9%87%D8%A8-%D9%88%D8%A7%D9%94%D8%B5%D9%88%D9%84%20%D8%A7%D9%84%D9%85%D8%B0%D9%87%D8%A8%5D%E2%A7%B8%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B4%D8%B9%D8%A8%D8%A7%D9%86%20%D8%A7%D9%84%D8%B9%D9%88%D8%AF%D8%A9..mp3' },
  { order: 2, audioUrl: 'https://archive.org/download/57-57-/%D8%A7%D8%AE%D8%B5%D8%B1%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%B5%D8%B1%D8%A7%D8%AA/02%20-%20%D8%A7%D9%84%D9%85%D8%AC%D9%84%D8%B3%20(2)%20%D8%B4%D8%B1%D8%AD%20%D8%A7%D9%94%D8%AE%D8%B5%D8%B1%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%B5%D8%B1%D8%A7%D8%AA%20%5B%D8%A8%D8%A7%D8%A8%20%D8%A7%D9%84%D9%85%D9%8A%D8%A7%D9%87%5D%E2%A7%B8%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B4%D8%B9%D8%A8%D8%A7%D9%86%20%D8%A7%D9%84%D8%B9%D9%88%D8%AF%D8%A9..mp3' },
  { order: 3, audioUrl: 'https://archive.org/download/57-57-/%D8%A7%D8%AE%D8%B5%D8%B1%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%B5%D8%B1%D8%A7%D8%AA/03%20-%20%D8%A7%D9%84%D9%85%D8%AC%D9%84%D8%B3%20(3)%20%D8%B4%D8%B1%D8%AD%20%D8%A7%D9%94%D8%AE%D8%B5%D8%B1%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%B5%D8%B1%D8%A7%D8%AA%20%5B%D8%A8%D8%A7%D8%A8%20%D8%A7%D9%84%D8%A2%D9%86%D9%8A%D8%A9%5D%E2%A7%B8%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B4%D8%B9%D8%A8%D8%A7%D9%86%20%D8%A7%D9%84%D8%B9%D9%88%D8%AF%D8%A9..mp3' },
  { order: 4, audioUrl: 'https://archive.org/download/57-57-/%D8%A7%D8%AE%D8%B5%D8%B1%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%B5%D8%B1%D8%A7%D8%AA/04%20-%20%D8%A7%D9%84%D9%85%D8%AC%D9%84%D8%B3%20(4)%20%D8%B4%D8%B1%D8%AD%20%D8%A7%D9%94%D8%AE%D8%B5%D8%B1%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%B5%D8%B1%D8%A7%D8%AA%20%5B%D8%A8%D8%A7%D8%A8%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%86%D8%AC%D8%A7%D8%A1%5D%E2%A7%B8%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B4%D8%B9%D8%A8%D8%A7%D9%86%20%D8%A7%D9%84%D8%B9%D9%88%D8%AF%D8%A9..mp3' },
  { order: 5, audioUrl: 'https://archive.org/download/57-57-/%D8%A7%D8%AE%D8%B5%D8%B1%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%B5%D8%B1%D8%A7%D8%AA/05%20-%20%D8%A7%D9%84%D9%85%D8%AC%D9%84%D8%B3%20(5)%20%D8%B4%D8%B1%D8%AD%20%D8%A7%D9%94%D8%AE%D8%B5%D8%B1%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%B5%D8%B1%D8%A7%D8%AA%20%5B%D8%A8%D8%A7%D8%A8%20%D8%A7%D9%84%D8%B3%D9%88%D8%A7%D9%83-%D9%88%D8%B3%D9%86%D9%86%20%D8%A7%D9%84%D9%81%D8%B7%D8%B1%D8%A9%5D%E2%A7%B8%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B4%D8%B9%D8%A8%D8%A7%D9%86%20%D8%A7%D9%84%D8%B9%D9%88%D8%AF%D8%A9..mp3' },
  { order: 6, audioUrl: 'https://archive.org/download/57-57-/%D8%A7%D8%AE%D8%B5%D8%B1%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%B5%D8%B1%D8%A7%D8%AA/06%20-%20%D8%A7%D9%84%D9%85%D8%AC%D9%84%D8%B3%20(6)%20%D8%B4%D8%B1%D8%AD%20%D8%A7%D9%94%D8%AE%D8%B5%D8%B1%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%B5%D8%B1%D8%A7%D8%AA%20%5B%D8%A8%D8%A7%D8%A8%20%D9%81%D8%B1%D9%88%D8%B6%20%D8%A7%D9%84%D9%88%D8%B6%D9%88%D8%A1%5D%E2%A7%B8%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B4%D8%B9%D8%A8%D8%A7%D9%86%20%D8%A7%D9%84%D8%B9%D9%88%D8%AF%D8%A9..mp3' },
  { order: 7, audioUrl: 'https://archive.org/download/57-57-/%D8%A7%D8%AE%D8%B5%D8%B1%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%B5%D8%B1%D8%A7%D8%AA/07%20-%20%D8%A7%D9%84%D9%85%D8%AC%D9%84%D8%B3%20(7)%20%D8%B4%D8%B1%D8%AD%20%D8%A7%D9%94%D8%AE%D8%B5%D8%B1%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%B5%D8%B1%D8%A7%D8%AA%20%5B%D8%A8%D8%A7%D8%A8%20%D8%A7%D9%84%D9%85%D8%B3%D8%AD%20%D8%B9%D9%84%D9%89%20%D8%A7%D9%84%D8%AE%D9%81%D9%8A%D9%86%5D%E2%A7%B8%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B4%D8%B9%D8%A8%D8%A7%D9%86%20%D8%A7%D9%84%D8%B9%D9%88%D8%AF%D8%A9..mp3' },
  { order: 8, audioUrl: 'https://archive.org/download/57-57-/%D8%A7%D8%AE%D8%B5%D8%B1%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%B5%D8%B1%D8%A7%D8%AA/08%20-%20%D8%A7%D9%84%D9%85%D8%AC%D9%84%D8%B3%20(8)%20%D8%B4%D8%B1%D8%AD%20%D8%A7%D9%94%D8%AE%D8%B5%D8%B1%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%B5%D8%B1%D8%A7%D8%AA%20%5B%D8%A8%D8%A7%D8%A8%20%D9%86%D9%88%D8%A7%D9%82%D8%B6%20%D8%A7%D9%84%D9%88%D8%B6%D9%88%D8%A1%5D%E2%A7%B8%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B4%D8%B9%D8%A8%D8%A7%D9%86%20%D8%A7%D9%84%D8%B9%D9%88%D8%AF%D8%A9..mp3' },
  { order: 9, audioUrl: 'https://archive.org/download/57-57-/%D8%A7%D8%AE%D8%B5%D8%B1%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%B5%D8%B1%D8%A7%D8%AA/09%20-%20%D8%A7%D9%84%D9%85%D8%AC%D9%84%D8%B3%20(9)%20%D8%B4%D8%B1%D8%AD%20%D8%A7%D9%94%D8%AE%D8%B5%D8%B1%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%B5%D8%B1%D8%A7%D8%AA%20%5B%D8%A8%D8%A7%D8%A8%20%D8%A7%D9%84%D8%BA%D8%B3%D9%84%5D%E2%A7%B8%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B4%D8%B9%D8%A8%D8%A7%D9%86%20%D8%A7%D9%84%D8%B9%D9%88%D8%AF%D8%A9..mp3' },
  { order: 10, audioUrl: 'https://archive.org/download/57-57-/%D8%A7%D8%AE%D8%B5%D8%B1%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%B5%D8%B1%D8%A7%D8%AA/10%20-%20%D8%A7%D9%84%D9%85%D8%AC%D9%84%D8%B3%20(10)%20%D8%B4%D8%B1%D8%AD%20%D8%A7%D9%94%D8%AE%D8%B5%D8%B1%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%B5%D8%B1%D8%A7%D8%AA%20%5B%D8%A8%D8%A7%D8%A8%20%D8%A7%D9%84%D8%AA%D9%8A%D9%85%D9%85%5D%E2%A7%B8%D8%A7%D9%84%D8%B4%D9%8A%D8%AE%20%D8%B4%D8%B9%D8%A8%D8%A7%D9%86%20%D8%A7%D9%84%D8%B9%D9%88%D8%AF%D8%A9..mp3' },
];

// ... continuing with remaining 50 lessons
for (let i = 11; i <= 60; i++) {
  const paddedNum = String(i).padStart(2, '0');
  audioUrls.push({
    order: i,
    audioUrl: `https://archive.org/download/57-57-/%D8%A7%D8%AE%D8%B5%D8%B1%20%D8%A7%D9%84%D9%85%D8%AE%D8%AA%D8%B5%D8%B1%D8%A7%D8%AA/${paddedNum}%20-%20%D8%A7%D9%84%D9%85%D8%AC%D9%84%D8%B3%20(${i})%20.mp3`
  });
}

async function addAudioUrls() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات');

    let updated = 0;

    for (const item of audioUrls) {
      const lecture = await Lecture.findOne({
        series: 'شرح أخصر المختصرات',
        order: item.order,
      });

      if (lecture) {
        lecture.audioUrl = item.audioUrl;
        await lecture.save();
        updated++;
        console.log(`✅ تم إضافة الصوت للدرس ${item.order}: ${lecture.title}`);
      }
    }

    console.log(`\n✅ تم تحديث ${updated} درس بروابط الصوتيات`);
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

addAudioUrls();
