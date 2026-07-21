export const getFallbackData = (url, params = {}) => {
  if (!url) return null;

  const lecturesDict = [
    {
      _id: 'demo-fiqh-1',
      title: 'شرح كتاب الفقه — الدرس الأول',
      youtubeUrl: 'https://youtu.be/eEbIxb3qIts?si=Fd-D3_Y3RwzpHkXw',
      youtubeId: 'eEbIxb3qIts',
      category: 'الفقه',
      series: 'دورة الفقه',
      teacher: 'الشيخ شعبان العودة',
      duration: '45 دقيقة',
      description: 'شرح لفضيلة الشيخ شعبان العودة في علم الفقه.',
    },
    {
      _id: 'demo-aqeedah-1',
      title: 'شرح كتاب العقيدة — الدرس الأول',
      youtubeUrl: 'https://youtu.be/sadd8pipy3o?si=qDqchDChBI_3BTBD',
      youtubeId: 'sadd8pipy3o',
      category: 'العقيدة',
      series: 'دورة العقيدة',
      teacher: 'الشيخ شعبان العودة',
      duration: '45 دقيقة',
      description: 'شرح لفضيلة الشيخ شعبان العودة في علم العقيدة.',
    },
    {
      _id: 'demo-seerah-1',
      title: 'شرح السيرة النبوية — الدرس الأول',
      youtubeUrl: 'https://youtu.be/bwhJgLVJekk?si=RJDAzLN-8S4EgCHc',
      youtubeId: 'bwhJgLVJekk',
      category: 'السيرة',
      series: 'سلسلة السيرة النبوية',
      teacher: 'الشيخ شعبان العودة',
      duration: '40 دقيقة',
      description: 'دروس السيرة النبوية لفضيلة الشيخ شعبان العودة.',
    },
    {
      _id: 'demo-adab-1',
      title: 'آداب طالب العلم — الدرس الأول',
      youtubeUrl: 'https://youtu.be/P_eIscF8i5s?si=OMYhviqQmzjuma_Z',
      youtubeId: 'P_eIscF8i5s',
      category: 'آداب طالب العلم',
      series: 'سلسلة آداب طالب العلم',
      teacher: 'الشيخ شعبان العودة',
      duration: '35 دقيقة',
      description: 'شرح وتوجيهات في آداب طالب العلم لفضيلة الشيخ شعبان العودة.',
    },
    {
      _id: 'demo-hadith-1',
      title: 'شرح علوم الحديث — الدرس الأول',
      youtubeUrl: 'https://youtu.be/yqHJJePxW18?si=xN2d5_37Qycm-Cto',
      youtubeId: 'yqHJJePxW18',
      category: 'الحديث',
      series: 'دورة الحديث الشريف',
      teacher: 'الشيخ شعبان العودة',
      duration: '50 دقيقة',
      description: 'شرح لفضيلة الشيخ شعبان العودة في علم الحديث.',
    },
    {
      _id: 'demo-usul-1',
      title: 'شرح كتاب غاية السول في علم الأصول — الدرس الأول',
      youtubeUrl: 'https://youtu.be/sadd8pipy3o?si=1wZF4hAkDgq3iaqG',
      youtubeId: 'sadd8pipy3o',
      category: 'أصول فقه',
      series: 'غاية السول في علم الأصول',
      teacher: 'الشيخ شعبان العودة',
      duration: '45 دقيقة',
      description: 'شرح منهج كتاب غاية السول في علم الأصول لفضيلة الشيخ شعبان العودة.',
    }
  ];

  // Handle single lecture view (/lectures/:id)
  if (url.startsWith('/lectures/')) {
    const id = url.split('/lectures/')[1];
    const item = lecturesDict.find((l) => l._id === id) || lecturesDict[0];
    const related = lecturesDict.filter((l) => l.category === item.category && l._id !== item._id);

    return {
      success: true,
      data: item,
      related: related.length ? related : lecturesDict.filter((l) => l._id !== item._id).slice(0, 3),
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
          title: `درس في ${cat || 'العلم الشرعي'} — الدرس الأول`,
          youtubeUrl: 'https://youtu.be/sadd8pipy3o?si=1wZF4hAkDgq3iaqG',
          youtubeId: 'sadd8pipy3o',
          category: cat || 'عام',
          series: `شرح ${cat || 'العلم الشرعي'}`,
          teacher: 'الشيخ شعبان العودة',
          duration: '40 دقيقة',
        }
      ],
      pagination: { page: 1, limit: 12, total: filtered.length || 1, pages: 1 }
    };
  }

  return { success: true, data: [] };
};
