export const DEFAULT_SITE_SETTINGS = {
  branding: {
    siteName: 'الموقع الرسمي للشيخ شعبان العودة',
    siteSubtitle: 'العلم الشرعي وتعليم القرآن',
    logoUrl: '',
    sheikhImageUrl: '',
    metaTitle: 'الموقع الرسمي للشيخ شعبان العودة',
    metaDescription:
      'دروس وكتب ومقالات مبوّبة بعناية في العقيدة والفقه والحديث والتفسير.',
  },
  hero: {
    badge: 'الموقع الرسمي',
    title: 'فضيلة الشيخ أبو عبيدة\nشعبان العودة',
    description:
      'دروس وكتب ومقالات مبوّبة بعناية في العقيدة والفقه والحديث والتفسير، لتيسير العلم الشرعي ونشره للمسلمين في كل مكان.',
    primaryCtaText: 'استعرض الدروس',
    primaryCtaLink: '/lectures',
    secondaryCtaText: 'تعرّف على الشيخ',
    secondaryCtaLink: '#about',
  },
  homeAbout: {
    title: 'تعريف بالشيخ',
    subtitle: 'أبو عبيدة شعبان بن سليم بن سالم العودة المصري الحنبلي',
    bullets: ['باحث شرعي مصري', 'مشتغل بمجالس السنة'],
    stats: [
      { value: '15+', label: 'كتاباً ومؤلفاً' },
      { value: '30+', label: 'مقالاً علمياً' },
      { value: '120+', label: 'درساً ومحاضرة' },
    ],
  },
  announcements: [
    'نسأل الله أن يبارك في علم الشيخ وينفع به الإسلام والمسلمين.',
    'تم إضافة سلسلة دروس "شرح كتاب التوحيد" كاملة.',
    'نرحب بكم في حلة الموقع الجديدة.',
  ],
  exploreLinks: [
    { label: 'الدروس المرئية', href: '/lectures' },
    { label: 'مكتبة الكتب', href: '/books' },
    { label: 'المقالات والبحوث', href: '/articles' },
    { label: 'جميع التصنيفات', href: '/lectures' },
  ],
  cta: {
    title: 'التواصل والتسجيل',
    description:
      'للاشتراك في البرامج العلمية، والحصول على التنبيهات للدروس المباشرة والإصدارات الجديدة، يسعدنا تواصلكم معنا.',
    buttonText: 'تواصل معنا الآن',
    buttonLink: '/contact',
  },
  aboutPage: {
    headerTitle: 'عن الشيخ',
    headerSubtitle: 'الموقع الرسمي لفضيلة الشيخ شعبان العودة',
    intro:
      'هذا الموقع هو المنصة الرسمية التي تُعنى بنشر العلم الشرعي لفضيلة الشيخ شعبان العودة على منهج السلف الصالح.',
    missionTitle: 'رسالة الموقع',
    missionParagraphs: [
      'يهدف الموقع إلى نشر العلم الشرعي على منهج السلف الصالح، وفق فهم الإمام أحمد بن حنبل ومنهج أهل السنة والجماعة.',
      'ويسعى إلى تقديم محتوى علمي موثوق من محاضرات ودروس ومقالات وكتب، تخدم طالب العلم والباحث والمهتم بعلوم الشريعة.',
    ],
    sheikhTitle: 'الشيخ شعبان العودة',
    sheikhBio:
      'الشيخ أبو عبيدة شعبان بن سليم بن سالم العودة المصري الحنبلي — حفظه الله — باحث شرعي مصري ومشتغل بمجالس السنة، يُشرف على هذا الموقع ويقدّم من خلاله دروساً ومحاضرات في العقيدة والفقه والتفسير وغيرها من العلوم الشرعية.',
    valuesTitle: 'محاور العمل',
    values: [
      'محاضرات ودروس مرئية على يوتيوب',
      'مقالات علمية ودعوية',
      'كتب ومؤلفات PDF للقراءة والتحميل',
      'التزام بمنهج أهل السنة والجماعة',
    ],
  },
  navbar: {
    links: [
      { to: '/', label: 'الرئيسية' },
      { to: '/#about', label: 'عن الشيخ' },
      { to: '/lectures', label: 'الدورات والبرامج' },
      { to: '/#explore', label: 'استكشف خيارات' },
      { to: '/contact', label: 'التواصل والتسجيل' },
    ],
    ctaText: 'سجّل الآن',
    ctaLink: '/contact',
  },
  footer: {
    title: 'الموقع الرسمي للشيخ شعبان العودة',
    description:
      'الموقع الرسمي للشيخ شعبان العودة، يقدّم دروسًا وكتبًا ومقالات شرعية مبوّبة.',
    email: 'info@imam-ahmad.com',
    socialLinks: [
      { label: 'تويتر / X', url: '' },
      { label: 'تيليجرام', url: '' },
    ],
    copyrightSuffix: 'جميع الحقوق محفوظة.',
  },
  contactPage: {
    headerTitle: 'التواصل والتسجيل',
    headerSubtitle: 'يسعدنا تواصلكم معنا للاشتراك والاستفسار',
  },
  categories: [
    { id: 'tafsir', name: 'التفسير', letter: 'ت', count: 29 },
    { id: 'fiqh', name: 'الفقه', letter: 'ف', count: 65 },
    { id: 'aqeedah', name: 'العقيدة', letter: 'ع', count: 42 },
    { id: 'hadith', name: 'الحديث', letter: 'ح', count: 38 },
    { id: 'seerah', name: 'السيرة', letter: 'س', count: 21 },
    { id: 'raqaiq', name: 'الرقائق', letter: 'ر', count: 18 },
    { id: 'quran_sciences', name: 'علوم قرآن', letter: 'ق', count: 12 },
    { id: 'hadith_term', name: 'مصطلح حديث', letter: 'م', count: 15 },
    { id: 'usul_fiqh', name: 'أصول فقه', letter: 'أ', count: 24 },
    { id: 'adab', name: 'آداب طالب العلم', letter: 'آ', count: 8 },
    { id: 'ilal', name: 'علل الحديث', letter: 'ع', count: 11 },
    { id: 'jarh', name: 'جرح وتعديل', letter: 'ج', count: 7 },
    { id: 'takhreej', name: 'التخريج', letter: 'خ', count: 9 },
    { id: 'qawaid', name: 'قواعد فقهية', letter: 'ق', count: 14 },
    { id: 'lugha', name: 'اللغة العربية', letter: 'ل', count: 17 },
    { id: 'general', name: 'دروس عامة', letter: 'د', count: 33 },
    { id: 'fawaid', name: 'فوائد', letter: 'ف', count: 50 },
  ],
};

export const SITE_SETTINGS_STORAGE_KEY = 'site_settings_v1';
