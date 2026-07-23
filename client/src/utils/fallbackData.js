export const mergeLocalLectures = (defaultList = []) => {
  let customItems = [];
  let deletedIds = [];
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      customItems = JSON.parse(localStorage.getItem('custom_admin_lectures_v2') || '[]');
      deletedIds = JSON.parse(localStorage.getItem('deleted_admin_lecture_ids_v2') || '[]');
    }
  } catch {
    // ignore
  }

  let merged = [...defaultList];
  customItems.forEach((cItem) => {
    const idx = merged.findIndex((m) => m._id === cItem._id);
    if (idx !== -1) {
      merged[idx] = { ...merged[idx], ...cItem };
    } else {
      merged.unshift(cItem);
    }
  });

  return merged.filter((item) => !deletedIds.includes(item._id));
};

export const mergeLocalBooks = (defaultList = []) => {
  let customBooks = [];
  let deletedBookIds = [];
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      customBooks = JSON.parse(localStorage.getItem('custom_admin_books_v2') || '[]');
      deletedBookIds = JSON.parse(localStorage.getItem('deleted_admin_book_ids_v2') || '[]');
    }
  } catch {
    // ignore
  }

  let merged = [...defaultList];
  customBooks.forEach((cBook) => {
    const idx = merged.findIndex((m) => m._id === cBook._id);
    if (idx !== -1) {
      merged[idx] = { ...merged[idx], ...cBook };
    } else {
      merged.unshift(cBook);
    }
  });

  return merged.filter((b) => !deletedBookIds.includes(b._id));
};

export const getFallbackData = (url, params = {}) => {
  if (!url) return null;

  const defaultPdf = 'https://archive.org/embed/20230616_20230616_1912';

  // Read admin custom lectures & deletions from localStorage if present
  const getMergedLectures = (defaultList) => mergeLocalLectures(defaultList);

  // Helper for Books merging
  const getMergedBooks = () => {
    const defaultBooks = [
      {
        _id: 'bk-1',
        title: 'كتاب القواعد المثلى في صفات الله وأسمائه الحسنى',
        author: 'فضيلة الشيخ شعبان العودة',
        category: 'العقيدة',
        pages: 50,
        description: 'نسخة PDF معتمدة ومطابقة لمجالس الشرح والتعليق لفضيلة الشيخ شعبان العودة.',
        pdfUrl: defaultPdf,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'bk-2',
        title: 'كتاب غاية السول في علم الأصول',
        author: 'فضيلة الشيخ شعبان العودة',
        category: 'أصول فقه',
        pages: 85,
        description: 'متن وشرح كتاب غاية السول في أصول الفقه لفضيلة الشيخ شعبان العودة.',
        pdfUrl: defaultPdf,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'bk-3',
        title: 'كتاب الفقه الميسر — الطهارة والصلاة',
        author: 'فضيلة الشيخ شعبان العودة',
        category: 'الفقه',
        pages: 120,
        description: 'دراسة فقهية ميسرة بالدليل من الكتاب والسنة.',
        pdfUrl: defaultPdf,
        createdAt: new Date().toISOString()
      }
    ];

    return mergeLocalBooks(defaultBooks);
  };

  // Handle Admin Stats Overview
  if (url === '/admin/stats') {
    return {
      success: true,
      data: {
        counts: { lectures: 6, articles: 4, books: 3, contacts: 2, unreadContacts: 1, students: 2 },
        recent: {
          lectures: [
            { _id: 'demo-aqeedah-1', title: 'التعليق على كتاب القواعد المثلى — المجلس (1)', category: 'العقيدة', createdAt: new Date().toISOString() },
            { _id: 'demo-usul-1', title: 'شرح كتاب غاية السول في علم الأصول — المجلس (1)', category: 'أصول فقه', createdAt: new Date().toISOString() }
          ],
          articles: [
            { _id: 'art-1', title: 'منهج الطالب الشرعي في تحصيل العلم', category: 'توجيهات', createdAt: new Date().toISOString() }
          ],
          books: [
            { _id: 'bk-1', title: 'كتاب القواعد المثلى في صفات الله وأسمائه الحسنى', author: 'الشيخ ابن عثيمين - بشرح الشيخ شعبان العودة', createdAt: new Date().toISOString() }
          ],
          contacts: [
            { _id: 'c-1', name: 'إبراهيم الليثي', subject: 'استفسار حول دورة القواعد المثلى', read: false, createdAt: new Date().toISOString() }
          ],
          students: [
            { _id: 'st-1', name: 'أحمد محمد', email: 'ahmad@example.com', phone: '', country: 'مصر', createdAt: new Date().toISOString() }
          ]
        }
      }
    };
  }

  // Handle Admin Contacts list
  if (url.startsWith('/contacts')) {
    return {
      success: true,
      data: [
        {
          _id: 'c-1',
          name: 'إبراهيم الليثي',
          email: 'user@example.com',
          subject: 'استفسار حول دورة القواعد المثلى',
          message: 'السلام عليكم ورحمة الله، كيف يمكنني الحصول على تفريغ مجالس كتاب القواعد المثلى؟ وجزاكم الله خيراً.',
          read: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: 'c-2',
          name: 'أحمد محمود',
          email: 'ahmed@example.com',
          subject: 'شكر وتقدير للشيخ شعبان العودة',
          message: 'جزاكم الله كل خير على هذه الدورة المباركة في أصول الفقه.',
          read: true,
          createdAt: new Date().toISOString()
        }
      ],
      pagination: { page: 1, limit: 10, total: 2, pages: 1 }
    };
  }

  if (url.startsWith('/admin/students')) {
    let local = [];
    try {
      local = JSON.parse(localStorage.getItem('registered_students_v1') || '[]');
    } catch {
      local = [];
    }
    const data = local.map((s) => ({
      _id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone || '',
      country: s.country || '',
      createdAt: s.createdAt,
    }));
    return {
      success: true,
      data,
      pagination: { page: 1, limit: 50, total: data.length, pages: 1 },
    };
  }

  // Handle Articles
  if (url.startsWith('/articles')) {
    return {
      success: true,
      data: [
        {
          _id: 'art-1',
          title: 'منهج الطالب الشرعي في تحصيل العلم',
          category: 'توجيهات',
          summary: 'توجيهات مباركة لفضيلة الشيخ شعبان العودة في كيفية تحصيل العلم الشرعي وتدوين الفوائد.',
          content: 'الحمد لله والصلاة والسلام على رسول الله... أما بعد: فإن طلب العلم من أفضل القربات...',
          createdAt: new Date().toISOString()
        }
      ],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 }
    };
  }

  // Handle Single Book View: /books/:id
  if (url.startsWith('/books/')) {
    const bookId = url.split('/books/')[1];
    const allBooks = getMergedBooks();
    const bookItem = allBooks.find((b) => b._id === bookId) || allBooks[0];
    const relatedBooks = allBooks.filter((b) => b._id !== bookItem._id);

    return {
      success: true,
      data: bookItem,
      related: relatedBooks,
    };
  }

  // Handle Books List View: /books
  if (url.startsWith('/books')) {
    const allBooks = getMergedBooks();
    const cat = params.category;
    const search = params.search?.toLowerCase();

    let filtered = [...allBooks];
    if (cat && cat !== 'الكل') {
      filtered = filtered.filter((b) => b.category === cat || b.category.includes(cat) || cat.includes(b.category));
    }
    if (search) {
      filtered = filtered.filter((b) => b.title.toLowerCase().includes(search) || b.author.toLowerCase().includes(search));
    }

    return {
      success: true,
      data: filtered,
      pagination: { page: 1, limit: 50, total: filtered.length, pages: 1 }
    };
  }

  const baseLecturesDict = [
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
      _id: 'demo-hadith-dawood-1',
      title: 'شرح كتاب سنن أبي داود — الدرس 1',
      youtubeUrl: 'https://www.youtube.com/watch?v=utBmANOrM90&list=PLzgycZElueFjEi_wdWoEYhU0_qBlSCXTB',
      youtubeId: 'utBmANOrM90',
      category: 'الحديث',
      series: 'سنن أبي داود',
      teacher: 'الشيخ شعبان العودة',
      duration: '50 دقيقة',
      description: 'الدرس الأول من شرح كتاب سنن أبي داود لفضيلة الشيخ شعبان العودة، ويتضمن مقدمة الشرح وقراءة في أول أبواب كتاب الطهارة.',
      pdfUrl: defaultPdf,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
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

  const lecturesDict = getMergedLectures(baseLecturesDict);

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
