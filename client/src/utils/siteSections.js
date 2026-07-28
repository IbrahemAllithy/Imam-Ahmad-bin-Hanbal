// البراعم والنساء قسمان مستقلان عن العلوم الشرعية: لكل واحد كتبه ودروسه.
// المحتوى يُفصل بقيمة category، وهي نص حر في موديلَي Book و Lecture، فلا
// حاجة لأي تعديل على الخادم. وهي ثوابت هنا لأن settingsController يعمل
// بقائمة مفاتيح مسموحة، فإضافة مفتاح جديد للإعدادات تستلزم نشرًا للخادم.
export const SITE_SECTIONS = [
  { id: 'kids', name: 'البراعم', path: '/kids' },
  { id: 'women', name: 'النساء', path: '/women' },
];

export const SECTION_NAMES = SITE_SECTIONS.map((s) => s.name);

export const getSectionById = (id) => SITE_SECTIONS.find((s) => s.id === id) || null;
