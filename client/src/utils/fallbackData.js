export const getFallbackData = (url, params = {}) => {
  if (!url) return null;

  // Handle single lecture view (/lectures/:id)
  if (url.startsWith('/lectures/')) {
    const id = url.split('/lectures/')[1];
    if (id === 'demo-usul-1' || id === '65a000000000000000000001' || id) {
      return {
        success: true,
        data: {
          _id: id || 'demo-usul-1',
          title: 'شرح كتاب غاية السول في علم الأصول — الدرس الأول',
          youtubeUrl: 'https://youtu.be/sadd8pipy3o?si=1wZF4hAkDgq3iaqG',
          youtubeId: 'sadd8pipy3o',
          category: 'أصول فقه',
          series: 'غاية السول في علم الأصول',
          teacher: 'الشيخ شعبان العودة',
          duration: '45 دقيقة',
          description: 'شرح منهج كتاب غاية السول في علم الأصول لفضيلة الشيخ شعبان العودة.',
        },
        related: [
          {
            _id: 'demo-usul-2',
            title: 'شرح كتاب غاية السول في علم الأصول — الدرس الثاني',
            youtubeUrl: 'https://youtu.be/sadd8pipy3o',
            youtubeId: 'sadd8pipy3o',
            category: 'أصول فقه',
            series: 'غاية السول في علم الأصول',
            teacher: 'الشيخ شعبان العودة',
            duration: '42 دقيقة',
          },
          {
            _id: 'demo-usul-3',
            title: 'شرح كتاب غاية السول في علم الأصول — الدرس الثالث',
            youtubeUrl: 'https://youtu.be/sadd8pipy3o',
            youtubeId: 'sadd8pipy3o',
            category: 'أصول فقه',
            series: 'غاية السول في علم الأصول',
            teacher: 'الشيخ شعبان العودة',
            duration: '50 دقيقة',
          }
        ]
      };
    }
  }

  // Handle lectures list (/lectures)
  if (url.startsWith('/lectures')) {
    const cat = params.category;
    const allLectures = [
      {
        _id: 'demo-usul-1',
        title: 'شرح كتاب غاية السول في علم الأصول — الدرس الأول',
        youtubeUrl: 'https://youtu.be/sadd8pipy3o?si=1wZF4hAkDgq3iaqG',
        youtubeId: 'sadd8pipy3o',
        category: 'أصول فقه',
        series: 'غاية السول في علم الأصول',
        teacher: 'الشيخ شعبان العودة',
        duration: '45 دقيقة',
      },
      {
        _id: 'demo-usul-2',
        title: 'شرح كتاب غاية السول في علم الأصول — الدرس الثاني',
        youtubeUrl: 'https://youtu.be/sadd8pipy3o',
        youtubeId: 'sadd8pipy3o',
        category: 'أصول فقه',
        series: 'غاية السول في علم الأصول',
        teacher: 'الشيخ شعبان العودة',
        duration: '42 دقيقة',
      },
      {
        _id: 'demo-aqeedah-1',
        title: 'شرح كتاب التوحيد — الدرس السادس عشر',
        youtubeUrl: 'https://youtu.be/sadd8pipy3o',
        youtubeId: 'sadd8pipy3o',
        category: 'العقيدة',
        series: 'شرح كتاب التوحيد',
        teacher: 'الشيخ شعبان العودة',
        duration: '45 دقيقة',
      },
      {
        _id: 'demo-aqeedah-2',
        title: 'شرح كتاب التوحيد — الدرس الخامس عشر',
        youtubeUrl: 'https://youtu.be/sadd8pipy3o',
        youtubeId: 'sadd8pipy3o',
        category: 'العقيدة',
        series: 'شرح كتاب التوحيد',
        teacher: 'الشيخ شعبان العودة',
        duration: '47 دقيقة',
      },
      {
        _id: 'demo-fiqh-1',
        title: 'شرح زاد المستقنع — كتاب الطهارة',
        youtubeUrl: 'https://youtu.be/sadd8pipy3o',
        youtubeId: 'sadd8pipy3o',
        category: 'الفقه',
        series: 'شرح زاد المستقنع',
        teacher: 'الشيخ شعبان العودة',
        duration: '50 دقيقة',
      },
      {
        _id: 'demo-tafsir-1',
        title: 'تفسير سورة البقرة — الآيات 1 إلى 10',
        youtubeUrl: 'https://youtu.be/sadd8pipy3o',
        youtubeId: 'sadd8pipy3o',
        category: 'التفسير',
        series: 'تفسير القرآن الكريم',
        teacher: 'الشيخ شعبان العودة',
        duration: '38 دقيقة',
      }
    ];

    const filtered = cat && cat !== 'الكل'
      ? allLectures.filter((l) => l.category === cat || l.category.includes(cat) || cat.includes(l.category))
      : allLectures;

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
