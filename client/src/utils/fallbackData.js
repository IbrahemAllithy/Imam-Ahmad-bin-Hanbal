export const getFallbackData = (url, params = {}) => {
  if (!url) return null;
  if (url.startsWith('/admin')) return null;

  const defaultPdf = 'https://archive.org/embed/20230616_20230616_1912';

  const lecturesDict = [
    // --- العقيدة: كتاب القواعد المثلى ---
    {
      _id: 'demo-aqeedah-1',
      title: 'التعليق على كتاب القواعد المثلى — المجلس (1)',
      youtubeUrl: 'https://youtu.be/sadd8pipy3o?si=qDqchDChBI_3BTBD',
      youtubeId: 'sadd8pipy3o',
      category: 'العقيدة',
      series: 'التعليق على كتاب القواعد المثلى',
      teacher: 'الشيخ شعبان العودة',
      duration: '45 دقيقة',
      description: 'المجلس الأول من شرح والتعليق على كتاب القواعد المثلى لفضيلة الشيخ شعبان العودة.',
      pdfUrl: defaultPdf,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      quizQuestions: [
        'ما معنى الأسماء الحسنى والصفات العلا؟',
        'اذكر ثلاثة من قواعد أسماء الله الحسنى.',
        'ما الفرق بين الاسم والصفة في حق الله تعالى؟'
      ],
      studentQuestions: [
        { id: 1, text: 'هل يمكن الاستماع للدرس بدون فيديو؟', answer: 'نعم، مشغل الصوت المباشر موجود أسفل الفيديو.' },
        { id: 2, text: 'كيف أستطيع قراءة الكتاب ومتابعة الشرح؟', answer: 'نافذة الكتاب PDF تجدها مباشرة بجوار فيديو الشرح.' }
      ]
    },
    {
      _id: 'demo-aqeedah-2',
      title: 'التعليق على كتاب القواعد المثلى — المجلس (2)',
      youtubeUrl: 'https://youtu.be/sadd8pipy3o?si=qDqchDChBI_3BTBD',
      youtubeId: 'sadd8pipy3o',
      category: 'العقيدة',
      series: 'التعليق على كتاب القواعد المثلى',
      teacher: 'الشيخ شعبان العودة',
      duration: '48 دقيقة',
      description: 'المجلس الثاني من التعليق على كتاب القواعد المثلى.',
      pdfUrl: defaultPdf,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      quizQuestions: ['ما القاعدة الثانية في صفات الله تعالى؟'],
      studentQuestions: []
    },
    {
      _id: 'demo-aqeedah-3',
      title: 'التعليق على كتاب القواعد المثلى — المجلس (3)',
      youtubeUrl: 'https://youtu.be/sadd8pipy3o?si=qDqchDChBI_3BTBD',
      youtubeId: 'sadd8pipy3o',
      category: 'العقيدة',
      series: 'التعليق على كتاب القواعد المثلى',
      teacher: 'الشيخ شعبان العودة',
      duration: '50 دقيقة',
      description: 'المجلس الثالث من التعليق على كتاب القواعد المثلى.',
      pdfUrl: defaultPdf,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      quizQuestions: ['ما حكم الإلحاد في أسماء الله وصفاته؟'],
      studentQuestions: []
    },

    // --- أصول الفقه: كتاب غاية السول ---
    {
      _id: 'demo-usul-1',
      title: 'شرح كتاب غاية السول في علم الأصول — المجلس (1)',
      youtubeUrl: 'https://youtu.be/sadd8pipy3o?si=1wZF4hAkDgq3iaqG',
      youtubeId: 'sadd8pipy3o',
      category: 'أصول فقه',
      series: 'غاية السول في علم الأصول',
      teacher: 'الشيخ شعبان العودة',
      duration: '45 دقيقة',
      description: 'شرح منهج كتاب غاية السول في علم الأصول لفضيلة الشيخ شعبان العودة.',
      pdfUrl: defaultPdf,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    {
      _id: 'demo-usul-2',
      title: 'شرح كتاب غاية السول في علم الأصول — المجلس (2)',
      youtubeUrl: 'https://youtu.be/sadd8pipy3o?si=1wZF4hAkDgq3iaqG',
      youtubeId: 'sadd8pipy3o',
      category: 'أصول فقه',
      series: 'غاية السول في علم الأصول',
      teacher: 'الشيخ شعبان العودة',
      duration: '42 دقيقة',
      description: 'المجلس الثاني من شرح كتاب غاية السول في علم الأصول.',
      pdfUrl: defaultPdf,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },

    // --- الفقه ---
    {
      _id: 'demo-fiqh-1',
      title: 'شرح كتاب الفقه — المجلس (1)',
      youtubeUrl: 'https://youtu.be/eEbIxb3qIts?si=Fd-D3_Y3RwzpHkXw',
      youtubeId: 'eEbIxb3qIts',
      category: 'الفقه',
      series: 'شرح الفقه الميسر',
      teacher: 'الشيخ شعبان العودة',
      duration: '45 دقيقة',
      description: 'شرح لفضيلة الشيخ شعبان العودة في علم الفقه.',
      pdfUrl: defaultPdf,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    {
      _id: 'demo-fiqh-2',
      title: 'شرح كتاب الفقه — المجلس (2)',
      youtubeUrl: 'https://youtu.be/eEbIxb3qIts?si=Fd-D3_Y3RwzpHkXw',
      youtubeId: 'eEbIxb3qIts',
      category: 'الفقه',
      series: 'شرح الفقه الميسر',
      teacher: 'الشيخ شعبان العودة',
      duration: '40 دقيقة',
      description: 'المجلس الثاني من شرح كتاب الفقه.',
      pdfUrl: defaultPdf,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },

    // --- السيرة ---
    {
      _id: 'demo-seerah-1',
      title: 'شرح السيرة النبوية — المجلس (1)',
      youtubeUrl: 'https://youtu.be/bwhJgLVJekk?si=RJDAzLN-8S4EgCHc',
      youtubeId: 'bwhJgLVJekk',
      category: 'السيرة',
      series: 'فصول في السيرة النبوية',
      teacher: 'الشيخ شعبان العودة',
      duration: '40 دقيقة',
      description: 'دروس السيرة النبوية لفضيلة الشيخ شعبان العودة.',
      pdfUrl: defaultPdf,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },

    // --- آداب طالب العلم ---
    {
      _id: 'demo-adab-1',
      title: 'آداب طالب العلم — المجلس (1)',
      youtubeUrl: 'https://youtu.be/P_eIscF8i5s?si=OMYhviqQmzjuma_Z',
      youtubeId: 'P_eIscF8i5s',
      category: 'آداب طالب العلم',
      series: 'حلية طالب العلم',
      teacher: 'الشيخ شعبان العودة',
      duration: '35 دقيقة',
      description: 'شرح وتوجيهات في آداب طالب العلم لفضيلة الشيخ شعبان العودة.',
      pdfUrl: defaultPdf,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },

    // --- الحديث ---
    {
      _id: 'demo-hadith-1',
      title: 'شرح علوم الحديث — المجلس (1)',
      youtubeUrl: 'https://youtu.be/yqHJJePxW18?si=xN2d5_37Qycm-Cto',
      youtubeId: 'yqHJJePxW18',
      category: 'الحديث',
      series: 'شرح منظومة البيقونية',
      teacher: 'الشيخ شعبان العودة',
      duration: '50 دقيقة',
      description: 'شرح لفضيلة الشيخ شعبان العودة في علم الحديث.',
      pdfUrl: defaultPdf,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    }
  ];

  if (url.startsWith('/lectures/')) {
    const id = url.split('/lectures/')[1];
    const item = lecturesDict.find((l) => l._id === id) || lecturesDict[0];
    
    const sameSeries = lecturesDict.filter((l) => l.series === item.series && l._id !== item._id);
    const sameCategory = lecturesDict.filter((l) => l.category === item.category && l._id !== item._id);
    const related = sameSeries.length ? sameSeries : sameCategory;

    return {
      success: true,
      data: item,
      related: related,
    };
  }

  if (url.startsWith('/lectures')) {
    const cat = params.category;

    const filtered = cat && cat !== 'الكل'
      ? lecturesDict.filter((l) => l.category === cat || l.category.includes(cat) || cat.includes(l.category))
      : lecturesDict;

    return {
      success: true,
      data: filtered.length ? filtered : [
        {
          _id: `demo-${Date.now()}`,
          title: `شرح كتاب في ${cat || 'العلم الشرعي'} — المجلس (1)`,
          youtubeUrl: 'https://youtu.be/sadd8pipy3o?si=qDqchDChBI_3BTBD',
          youtubeId: 'sadd8pipy3o',
          category: cat || 'عام',
          series: `كتاب ${cat || 'العلم الشرعي'}`,
          teacher: 'الشيخ شعبان العودة',
          duration: '40 دقيقة',
          pdfUrl: defaultPdf,
        }
      ],
      pagination: { page: 1, limit: 12, total: filtered.length || 1, pages: 1 }
    };
  }

  return { success: true, data: [] };
};
