#!/usr/bin/env node

/**
 * سكريبت تفاعلي لإضافة دروس أخصر المختصرات
 * يطلب رابط قاعدة البيانات بشكل تفاعلي
 */

import mongoose from 'mongoose';
import Lecture from '../models/Lecture.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

const ARCHIVE_BASE = 'https://archive.org/download/57-57-.';

const lessons = [
  { order: 1, title: 'المجلس (1) شرح أخصر المختصرات [مقدمة عن التمذهب وأصول المذهب]' },
  { order: 2, title: 'المجلس (2) شرح أخصر المختصرات [باب المياه]' },
  { order: 3, title: 'المجلس (3) شرح أخصر المختصرات [باب الآنية]' },
  { order: 4, title: 'المجلس (4) شرح أخصر المختصرات [باب الاستنجاء]' },
  { order: 5, title: 'المجلس (5) شرح أخصر المختصرات [باب السواك وسنن الفطرة]' },
  { order: 6, title: 'المجلس (6) شرح أخصر المختصرات [باب فروض الوضوء]' },
  { order: 7, title: 'المجلس (7) شرح أخصر المختصرات [باب المسح على الخفين]' },
  { order: 8, title: 'المجلس (8) شرح أخصر المختصرات [باب نواقض الوضوء]' },
  { order: 9, title: 'المجلس (9) شرح أخصر المختصرات [باب الغسل]' },
  { order: 10, title: 'المجلس (10) شرح أخصر المختصرات [باب التيمم]' },
  { order: 11, title: 'المجلس (11) شرح أخصر المختصرات [باب إزالة النجاسة]' },
  { order: 12, title: 'المجلس (12) شرح أخصر المختصرات [باب الحيض]' },
  { order: 13, title: 'المجلس (13) شرح أخصر المختصرات [كتاب الصلاة باب المواقيت]' },
  { order: 14, title: 'المجلس (14) شرح أخصر المختصرات [باب شروط الصلاة]' },
  { order: 15, title: 'المجلس (15) شرح أخصر المختصرات [باب صفة الصلاة]' },
  { order: 16, title: 'المجلس (16) شرح أخصر المختصرات [مكروهات الصلاة]' },
  { order: 17, title: 'المجلس (17) شرح أخصر المختصرات [سجود السهو]' },
  { order: 18, title: 'المجلس (18) شرح أخصر المختصرات [صلاة التطوع]' },
  { order: 19, title: 'المجلس (19) شرح أخصر المختصرات [سجود التلاوة - أوقات النهي - صلاة الجماعة]' },
  { order: 20, title: 'المجلس (20) شرح أخصر المختصرات [الإمامة - أحكام الاقتداء]' },
  { order: 21, title: 'المجلس (21) شرح أخصر المختصرات [صلاة أهل الأعذار]' },
  { order: 22, title: 'المجلس (22) شرح أخصر المختصرات [صلاة الجمعة]' },
  { order: 23, title: 'المجلس (23) شرح أخصر المختصرات [صلاة العيدين]' },
  { order: 24, title: 'المجلس (24) شرح أخصر المختصرات [صلاة الكسوف]' },
  { order: 25, title: 'المجلس (25) شرح أخصر المختصرات [صلاة الاستسقاء]' },
  { order: 26, title: 'المجلس (26) شرح أخصر المختصرات [كتاب الجنائز]' },
  { order: 27, title: 'المجلس (27) شرح أخصر المختصرات [كتاب الزكاة]' },
  { order: 28, title: 'المجلس (28) شرح أخصر المختصرات [تابع كتاب الزكاة]' },
  { order: 29, title: 'المجلس (29) شرح أخصر المختصرات [زكاة الفطر]' },
  { order: 30, title: 'المجلس (30) شرح أخصر المختصرات [كتاب الصيام]' },
  { order: 31, title: 'المجلس (31) شرح أخصر المختصرات [تابع كتاب الصيام]' },
  { order: 32, title: 'المجلس (32) شرح أخصر المختصرات [الاعتكاف]' },
  { order: 33, title: 'المجلس (33) شرح أخصر المختصرات [كتاب الحج]' },
  { order: 34, title: 'المجلس (34) شرح أخصر المختصرات [تابع كتاب الحج - صفة الحج]' },
  { order: 35, title: 'المجلس (35) شرح أخصر المختصرات [محظورات الإحرام]' },
  { order: 36, title: 'المجلس (36) شرح أخصر المختصرات [الفدية والهدي]' },
  { order: 37, title: 'المجلس (37) شرح أخصر المختصرات [كتاب البيوع]' },
  { order: 38, title: 'المجلس (38) شرح أخصر المختصرات [تابع كتاب البيوع]' },
  { order: 39, title: 'المجلس (39) شرح أخصر المختصرات [الربا]' },
  { order: 40, title: 'المجلس (40) شرح أخصر المختصرات [الخيار]' },
  { order: 41, title: 'المجلس (41) شرح أخصر المختصرات [السلم]' },
  { order: 42, title: 'المجلس (42) شرح أخصر المختصرات [القرض - الرهن]' },
  { order: 43, title: 'المجلس (43) شرح أخصر المختصرات [التفليس - الحجر - الصلح - الحوالة]' },
  { order: 44, title: 'المجلس (44) شرح أخصر المختصرات [الضمان - الكفالة - الشركة]' },
  { order: 45, title: 'المجلس (45) شرح أخصر المختصرات [الوكالة - الإقرار]' },
  { order: 46, title: 'المجلس (46) شرح أخصر المختصرات [العارية - الغصب]' },
  { order: 47, title: 'المجلس (47) شرح أخصر المختصرات [الشفعة - القراض - المساقاة]' },
  { order: 48, title: 'المجلس (48) شرح أخصر المختصرات [إحياء الموات - الجعالة - اللقطة]' },
  { order: 49, title: 'المجلس (49) شرح أخصر المختصرات [اللقيط - الوديعة]' },
  { order: 50, title: 'المجلس (50) شرح أخصر المختصرات [قسم الصدقات - الهبة - الوقف]' },
  { order: 51, title: 'المجلس (51) شرح أخصر المختصرات [العطية - الوصية]' },
  { order: 52, title: 'المجلس (52) شرح أخصر المختصرات [كتاب الفرائض]' },
  { order: 53, title: 'المجلس (53) شرح أخصر المختصرات [تابع كتاب الفرائض]' },
  { order: 54, title: 'المجلس (54) شرح أخصر المختصرات [كتاب النكاح]' },
  { order: 55, title: 'المجلس (55) شرح أخصر المختصرات [تابع كتاب النكاح]' },
  { order: 56, title: 'المجلس (56) شرح أخصر المختصرات [الصداق - الوليمة]' },
  { order: 57, title: 'المجلس (57) شرح أخصر المختصرات [القسم - الخلع]' },
  { order: 58, title: 'المجلس (58) شرح أخصر المختصرات [الطلاق]' },
  { order: 59, title: 'المجلس (59) شرح أخصر المختصرات [تابع الطلاق - الرجعة]' },
  { order: 60, title: 'المجلس (60) شرح أخصر المختصرات [الإيلاء - الظهار - اللعان - العدة - الاستبراء]' },
];

function buildAudioUrl(order, title) {
  const paddedOrder = String(order).padStart(2, '0');
  const filename = `${paddedOrder} - ${title}⧸الشيخ شعبان العودة..mp3`;
  const encodedFilename = encodeURIComponent(`اخصر المختصرات/${filename}`);
  return `${ARCHIVE_BASE}/${encodedFilename}`;
}

async function main() {
  console.log('🎯 سكريبت إضافة دروس أخصر المختصرات');
  console.log('=' .repeat(50));
  console.log('');

  // طلب رابط قاعدة البيانات
  const dbUri = await question('أدخل رابط MongoDB (أو اضغط Enter لاستخدام الرابط من .env): ');

  const MONGODB_URI = dbUri.trim() || process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('\n❌ لم يتم توفير رابط قاعدة البيانات!');
    rl.close();
    process.exit(1);
  }

  try {
    console.log('\n🔌 جاري الاتصال بقاعدة البيانات...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح\n');

    console.log('📚 جاري إضافة 60 درساً من سلسلة "شرح أخصر المختصرات"...\n');

    let addedCount = 0;
    let skippedCount = 0;

    for (const lesson of lessons) {
      const audioUrl = buildAudioUrl(lesson.order, lesson.title);

      const existing = await Lecture.findOne({
        series: 'شرح أخصر المختصرات',
        order: lesson.order,
      });

      if (existing) {
        console.log(`⏭️  ${lesson.order}. موجود مسبقاً - تم التخطي`);
        skippedCount++;
        continue;
      }

      await Lecture.create({
        title: lesson.title,
        youtubeUrl: '',
        youtubeId: 'audio-only',
        description: `درس صوتي من سلسلة شرح أخصر المختصرات لفضيلة الشيخ شعبان العودة`,
        series: 'شرح أخصر المختصرات',
        category: 'الفقه',
        order: lesson.order,
        audioUrl,
        publishedAt: new Date(),
      });

      console.log(`✅ ${lesson.order}. ${lesson.title.substring(0, 60)}...`);
      addedCount++;
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 ملخص العملية:');
    console.log(`   ✅ تمت الإضافة: ${addedCount} درس`);
    console.log(`   ⏭️  تم التخطي: ${skippedCount} درس`);
    console.log(`   📚 الإجمالي: ${lessons.length} درس`);
    console.log('='.repeat(50));

    if (addedCount > 0) {
      console.log('\n✨ تم نشر الدروس بنجاح!');
      console.log('\n🔗 يمكنك الوصول للدروس من:');
      console.log('   - قسم الفقه: /lectures?category=الفقه');
      console.log('   - صفحة الدورة: /courses/شرح أخصر المختصرات');
    }

  } catch (error) {
    console.error('\n❌ حدث خطأ:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 تم قطع الاتصال بقاعدة البيانات');
    rl.close();
  }
}

main();
