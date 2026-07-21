export const getFallbackData = (url, params = {}) => {
  if (!url) return null;

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
    }
  ];

  // Handle single lecture view (/lectures/:id)
  if (url.startsWith('/lectures/')) {
    const id = url.split('/lectures/')[1];
    const item = lecturesDict.find((l) => l._id === id) || lecturesDict[0];
    
    // Strictly filter related/playlist items to SAME SERIES or SAME CATEGORY only
    const sameSeries = lecturesDict.filter((l) => l.series === item.series && l._id !== item._id);
    const sameCategory = lecturesDict.filter((l) => l.category === item.category && l._id !== item._id);
    const related = sameSeries.length ? sameSeries : sameCategory;

    return {
      success: true,
      data: item,
      related: related,
    };
  }

  // Handle lectures list (/lectures)
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
        }
      ],
      pagination: { page: 1, limit: 12, total: filtered.length || 1, pages: 1 }
    };
  }

  return { success: true, data: [] };
};
