import 'dotenv/config';
import mongoose from 'mongoose';
import Lecture from '../models/Lecture.js';
import { notifyAllStudents } from '../controllers/notificationController.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات');

    const title = 'شرح كتاب سنن أبي داود — الدرس 1';
    const youtubeUrl = 'https://www.youtube.com/watch?v=utBmANOrM90&list=PLzgycZElueFjEi_wdWoEYhU0_qBlSCXTB';
    const youtubeId = 'utBmANOrM90';
    const category = 'الحديث';
    const series = 'سنن أبي داود';
    const description = 'الدرس الأول من شرح كتاب سنن أبي داود لفضيلة الشيخ شعبان العودة، ويتضمن مقدمة الشرح وقراءة في أول أبواب كتاب الطهارة.';

    let lecture = await Lecture.findOne({ youtubeId, series });
    if (!lecture) {
      lecture = await Lecture.create({
        title,
        youtubeUrl,
        youtubeId,
        category,
        series,
        description,
        order: 1,
        quizQuestions: [
          'ما موضوع كتاب سنن أبي داود؟',
          'اذكر الفائدة الأولى التي استنبطها الشيخ من الباب الأول.',
        ],
        quizItems: [
          {
            question: 'من مؤلف كتاب السنن الذي يدور عليه هذا الشرح؟',
            options: [
              'الإمام أبو داود السجستاني',
              'الإمام الترمذي',
              'الإمام النسائي',
              'الإمام ابن ماجه',
            ],
            correctIndex: 0,
          },
          {
            question: 'ما التبويب الذي بدأ به المصنف في الكتاب؟',
            options: ['كتاب الطهارة', 'كتاب الإيمان', 'كتاب الصلاة', 'كتاب الزكاة'],
            correctIndex: 0,
          },
        ],
      });
      console.log('✅ تم إضافة الدرس بنجاح مع المعرف:', lecture._id);

      const notifyResult = await notifyAllStudents({
        type: 'lecture',
        title: `درس جديد: ${title}`,
        body: `تم نشر درس جديد في قسم الحديث ضمن سلسلة (${series}): ${title}.`,
        link: `/lectures/${lecture._id}`,
      });
      console.log('✅ تم إرسال الإشعارات للطلاب:', notifyResult);
    } else {
      console.log('ℹ️ الدرس موجود مسبقاً في قاعدة البيانات:', lecture._id);
    }
  } catch (err) {
    console.error('❌ خطأ أثناء الإضافة:', err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
