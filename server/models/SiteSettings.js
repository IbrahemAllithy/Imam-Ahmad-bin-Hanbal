import mongoose from 'mongoose';

export const DEFAULT_SETTINGS = {
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
    ctaLink: '/register',
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

const navLinkSchema = new mongoose.Schema(
  {
    to: { type: String, trim: true, default: '/' },
    label: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const exploreLinkSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: '' },
    href: { type: String, trim: true, default: '/' },
  },
  { _id: false }
);

const socialLinkSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: '' },
    url: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const statSchema = new mongoose.Schema(
  {
    value: { type: String, trim: true, default: '' },
    label: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    id: { type: String, trim: true, default: '' },
    name: { type: String, trim: true, required: true },
    letter: { type: String, trim: true, maxlength: 2, default: '' },
    count: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const siteSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      default: 'main',
    },
    branding: {
      siteName: { type: String, trim: true, default: DEFAULT_SETTINGS.branding.siteName },
      siteSubtitle: { type: String, trim: true, default: DEFAULT_SETTINGS.branding.siteSubtitle },
      logoUrl: { type: String, trim: true, default: '' },
      sheikhImageUrl: { type: String, trim: true, default: '' },
      metaTitle: { type: String, trim: true, default: DEFAULT_SETTINGS.branding.metaTitle },
      metaDescription: {
        type: String,
        trim: true,
        default: DEFAULT_SETTINGS.branding.metaDescription,
      },
    },
    hero: {
      badge: { type: String, trim: true, default: DEFAULT_SETTINGS.hero.badge },
      title: { type: String, trim: true, default: DEFAULT_SETTINGS.hero.title },
      description: { type: String, trim: true, default: DEFAULT_SETTINGS.hero.description },
      primaryCtaText: { type: String, trim: true, default: DEFAULT_SETTINGS.hero.primaryCtaText },
      primaryCtaLink: { type: String, trim: true, default: DEFAULT_SETTINGS.hero.primaryCtaLink },
      secondaryCtaText: {
        type: String,
        trim: true,
        default: DEFAULT_SETTINGS.hero.secondaryCtaText,
      },
      secondaryCtaLink: {
        type: String,
        trim: true,
        default: DEFAULT_SETTINGS.hero.secondaryCtaLink,
      },
    },
    homeAbout: {
      title: { type: String, trim: true, default: DEFAULT_SETTINGS.homeAbout.title },
      subtitle: { type: String, trim: true, default: DEFAULT_SETTINGS.homeAbout.subtitle },
      bullets: { type: [String], default: DEFAULT_SETTINGS.homeAbout.bullets },
      stats: { type: [statSchema], default: DEFAULT_SETTINGS.homeAbout.stats },
    },
    announcements: { type: [String], default: DEFAULT_SETTINGS.announcements },
    exploreLinks: { type: [exploreLinkSchema], default: DEFAULT_SETTINGS.exploreLinks },
    cta: {
      title: { type: String, trim: true, default: DEFAULT_SETTINGS.cta.title },
      description: { type: String, trim: true, default: DEFAULT_SETTINGS.cta.description },
      buttonText: { type: String, trim: true, default: DEFAULT_SETTINGS.cta.buttonText },
      buttonLink: { type: String, trim: true, default: DEFAULT_SETTINGS.cta.buttonLink },
    },
    aboutPage: {
      headerTitle: { type: String, trim: true, default: DEFAULT_SETTINGS.aboutPage.headerTitle },
      headerSubtitle: {
        type: String,
        trim: true,
        default: DEFAULT_SETTINGS.aboutPage.headerSubtitle,
      },
      intro: { type: String, trim: true, default: DEFAULT_SETTINGS.aboutPage.intro },
      missionTitle: { type: String, trim: true, default: DEFAULT_SETTINGS.aboutPage.missionTitle },
      missionParagraphs: {
        type: [String],
        default: DEFAULT_SETTINGS.aboutPage.missionParagraphs,
      },
      sheikhTitle: { type: String, trim: true, default: DEFAULT_SETTINGS.aboutPage.sheikhTitle },
      sheikhBio: { type: String, trim: true, default: DEFAULT_SETTINGS.aboutPage.sheikhBio },
      valuesTitle: { type: String, trim: true, default: DEFAULT_SETTINGS.aboutPage.valuesTitle },
      values: { type: [String], default: DEFAULT_SETTINGS.aboutPage.values },
    },
    navbar: {
      links: { type: [navLinkSchema], default: DEFAULT_SETTINGS.navbar.links },
      ctaText: { type: String, trim: true, default: DEFAULT_SETTINGS.navbar.ctaText },
      ctaLink: { type: String, trim: true, default: DEFAULT_SETTINGS.navbar.ctaLink },
    },
    footer: {
      title: { type: String, trim: true, default: DEFAULT_SETTINGS.footer.title },
      description: { type: String, trim: true, default: DEFAULT_SETTINGS.footer.description },
      email: { type: String, trim: true, default: DEFAULT_SETTINGS.footer.email },
      socialLinks: { type: [socialLinkSchema], default: DEFAULT_SETTINGS.footer.socialLinks },
      copyrightSuffix: {
        type: String,
        trim: true,
        default: DEFAULT_SETTINGS.footer.copyrightSuffix,
      },
    },
    contactPage: {
      headerTitle: {
        type: String,
        trim: true,
        default: DEFAULT_SETTINGS.contactPage.headerTitle,
      },
      headerSubtitle: {
        type: String,
        trim: true,
        default: DEFAULT_SETTINGS.contactPage.headerSubtitle,
      },
    },
    categories: { type: [categorySchema], default: DEFAULT_SETTINGS.categories },
  },
  { timestamps: true }
);

siteSettingsSchema.statics.getSingleton = async function getSingleton() {
  let doc = await this.findOne({ key: 'main' });
  if (!doc) {
    doc = await this.create({ key: 'main', ...DEFAULT_SETTINGS });
  }
  return doc;
};

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

export default SiteSettings;
