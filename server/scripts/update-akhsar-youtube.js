import 'dotenv/config';
import mongoose from 'mongoose';
import Lecture from '../models/Lecture.js';

// روابط الفيديوهات من الـ playlist
const videos = [
  { order: 1, youtubeId: 'sPemSL49_r4' },
  { order: 2, youtubeId: 'oU-xsJ7yxaU' },
  { order: 3, youtubeId: 'lq7UOLbN-2k' },
  { order: 4, youtubeId: 'MnKGWVxk0Sc' },
  { order: 5, youtubeId: 'OUvPHlhf3dE' },
  { order: 6, youtubeId: 'bpZ95Pd0h7E' },
  { order: 7, youtubeId: 'XNDB3BL6bPQ' },
  { order: 8, youtubeId: 'QdYtOv5ND3I' },
  { order: 9, youtubeId: 'L_5LcKJwYBk' },
  { order: 10, youtubeId: 'rqOdtMVLl68' },
  { order: 11, youtubeId: 'zKOwIi2cqYo' },
  { order: 12, youtubeId: 'fHkm-t9qXjU' },
  { order: 13, youtubeId: 'LqmQnzL1Kq0' },
  { order: 14, youtubeId: 'eU4Z8SqSnJc' },
  { order: 15, youtubeId: 'xFYH0fCdxC8' },
  { order: 16, youtubeId: '3qZiZ-6yhxo' },
  { order: 17, youtubeId: 'h4ztEIqjnMg' },
  { order: 18, youtubeId: '7t_oK95ufOQ' },
  { order: 19, youtubeId: 'Rn4vJiAmIvs' },
  { order: 20, youtubeId: 'CqvP5mM_3Ok' },
  { order: 21, youtubeId: 'SX2dz-_gZ3w' },
  { order: 22, youtubeId: 'FjdR4vvjF1A' },
  { order: 23, youtubeId: '0jMlrQCITuw' },
  { order: 24, youtubeId: 'Yy5T0ndqx2E' },
  { order: 25, youtubeId: 'gYLzYo7IzVQ' },
  { order: 26, youtubeId: 'CfLG0yzXtY8' },
  { order: 27, youtubeId: 'F09LnQBxZFM' },
  { order: 28, youtubeId: 'b6B4mqmY0w0' },
  { order: 29, youtubeId: 'o9f9bU_Khzo' },
  { order: 30, youtubeId: 'ZpR9HHrfhGk' },
  { order: 31, youtubeId: '9aWvj0L1r6E' },
  { order: 32, youtubeId: '_0DlsVrNPY8' },
  { order: 33, youtubeId: 'xMp-6sI9hBk' },
  { order: 34, youtubeId: 'T2NVkWx6u9w' },
  { order: 35, youtubeId: 'gj3iXZFyUuU' },
  { order: 36, youtubeId: 'KSEZkEEQ6KY' },
  { order: 37, youtubeId: 'VkWqo_xqK3g' },
  { order: 38, youtubeId: 'C0s0ND1c2oc' },
  { order: 39, youtubeId: 'AWAMm2cXILU' },
  { order: 40, youtubeId: 'H7wENE8LcKQ' },
  { order: 41, youtubeId: 'y3b_oUWqvyM' },
  { order: 42, youtubeId: 'MQcWBG0Y0-E' },
  { order: 43, youtubeId: 'i0LTv9zWlv4' },
  { order: 44, youtubeId: 'xHUqGBR6CyY' },
  { order: 45, youtubeId: 'HWKyxcO_5m4' },
  { order: 46, youtubeId: 'sLlcfIKXgqk' },
  { order: 47, youtubeId: 'oUEh37TQFVU' },
  { order: 48, youtubeId: 'DBMTPR6rKKY' },
  { order: 49, youtubeId: 'Ke60Ei5U9e8' },
  { order: 50, youtubeId: 'S2nvRtzaTFw' },
  { order: 51, youtubeId: 'X2CU6Pn-h9Y' },
  { order: 52, youtubeId: 'a5WvJSVA2P0' },
  { order: 53, youtubeId: 'BfJaJj0Xg2I' },
  { order: 54, youtubeId: 'rrWLpKkw3yc' },
  { order: 55, youtubeId: 'CKqQxvUe-tY' },
  { order: 56, youtubeId: 'eM2v80s1VXs' },
  { order: 57, youtubeId: 'A4MR-K2r53M' },
  { order: 58, youtubeId: 'Ivm92G0e0Fg' },
  { order: 59, youtubeId: 'qGxNCDVDe9M' },
  { order: 60, youtubeId: 'Fmit_YAx-10' },
];

async function updateLectures() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات');

    let updated = 0;

    for (const video of videos) {
      const lecture = await Lecture.findOne({
        series: 'شرح أخصر المختصرات',
        order: video.order,
      });

      if (lecture) {
        lecture.youtubeId = video.youtubeId;
        lecture.youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;
        await lecture.save();
        updated++;
        console.log(`✅ تم تحديث الدرس ${video.order}: ${lecture.title}`);
      } else {
        console.log(`⚠️ لم يتم العثور على الدرس رقم ${video.order}`);
      }
    }

    console.log(`\n✅ تم تحديث ${updated} درس بنجاح`);
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

updateLectures();
