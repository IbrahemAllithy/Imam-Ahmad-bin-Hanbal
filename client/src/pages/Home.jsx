import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { sheikh, logo } from '../assets';
import { getStorageUrl } from '../services/api';
import './Home.css';
import {
  FiBookOpen,
  FiBook,
  FiFileText,
  FiVideo,
  FiList,
  FiCheckCircle,
  FiChevronLeft,
  FiPhoneCall
} from 'react-icons/fi';

const exploreLinks = [
  { label: 'الدروس المرئية', icon: <FiVideo />, href: '/lectures' },
  { label: 'مكتبة الكتب', icon: <FiBook />, href: '/books' },
  { label: 'المقالات والبحوث', icon: <FiFileText />, href: '/articles' },
  { label: 'جميع التصنيفات', icon: <FiList />, href: '/lectures' },
];

const categories = [
  { id: 'aqeedah', name: 'العقيدة', letter: 'ع', count: 42 },
  { id: 'fiqh', name: 'الفقه', letter: 'ف', count: 65 },
  { id: 'hadith', name: 'الحديث', letter: 'ح', count: 38 },
  { id: 'tafsir', name: 'التفسير', letter: 'ت', count: 29 },
  { id: 'seerah', name: 'السيرة', letter: 'س', count: 21 },
  { id: 'lugha', name: 'اللغة العربية', letter: 'ل', count: 17 },
];

const announcements = [
  'نسأل الله أن يبارك في علم الشيخ وينفع به الإسلام والمسلمين.',
  'تم إضافة سلسلة دروس "شرح كتاب التوحيد" كاملة.',
  'نرحب بكم في حلة الموقع الجديدة.',
];

const Home = () => {
  const { data: lectures, loading: l1 } = useFetch('/lectures', { limit: 4 });
  const { data: articles, loading: l2 } = useFetch('/articles', { limit: 4 });
  const { data: books, loading: l3 } = useFetch('/books', { limit: 4 });

  return (
    <div className="home-wrapper">
      
      {/* Hero Section */}
      <section className="home-hero">
        <div className="hero-pattern"></div>
        <div className="hero-inner">
          <div className="hero-content animate-fade-in-up">
            <div className="hero-badge">الموقع الرسمي</div>
            <h1 className="hero-title">فضيلة الشيخ أبو عبيدة<br />شعبان العودة</h1>
            <p className="hero-desc">دروس وكتب ومقالات مبوّبة بعناية في العقيدة والفقه والحديث والتفسير، لتيسير العلم الشرعي ونشره للمسلمين في كل مكان.</p>
            <div className="hero-actions">
              <Link to="/lectures" className="btn btn-primary hover-lift">استعرض الدروس</Link>
              <a href="#about" className="btn btn-outline hover-lift">تعرّف على الشيخ</a>
            </div>
          </div>
          <div className="hero-visual animate-fade-in-up delay-200">
            <img src={sheikh} alt="الشيخ شعبان العودة" className="hero-image" />
          </div>
        </div>
      </section>

      {/* Stats / About Section */}
      <section id="about" className="home-about animate-fade-in-up delay-300">
        <div className="about-inner">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><FiVideo /></div>
              <div className="stat-num">350+</div>
              <div className="stat-label">درس مرئي وصوتي</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FiBook /></div>
              <div className="stat-num">45</div>
              <div className="stat-label">كتاب ومؤلف</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FiFileText /></div>
              <div className="stat-num">120+</div>
              <div className="stat-label">مقال وبحث علمي</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories & Announcements Section */}
      <section className="home-categories">
        <div className="categories-inner">
          
          <div className="announcements-sidebar animate-fade-in-up">
            <div className="announcements-title">
              <FiCheckCircle /> إعلانات الموقع
            </div>
            <div className="announcements-list">
              {announcements.map((an, idx) => (
                <div key={idx} className="announcement-item">{an}</div>
              ))}
            </div>
          </div>

          <div className="categories-main animate-fade-in-up delay-100">
            <div className="categories-header">
              <h2>الدورات والبرامج</h2>
              <p>اختر العلم الذي تريد البدء بدراسته</p>
            </div>
            <div className="categories-grid">
              {categories.map((cat, idx) => (
                <Link key={idx} to={`/lectures?category=${cat.name}`} className="category-card">
                  <div className="category-icon">
                    <span>{cat.letter}</span>
                  </div>
                  <div>
                    <div className="category-name">{cat.name}</div>
                    <div className="category-count">{cat.count} درسًا</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
        </div>
      </section>

      {/* Explore Options Section */}
      <section id="explore" className="home-explore">
        <div className="explore-inner">
          <div className="categories-header text-center animate-fade-in-up">
            <h2>استكشف خيارات التعلّم</h2>
            <p>تصفح محتوى الموقع بطريقة سهلة وميسرة</p>
          </div>
          <div className="explore-grid">
            {exploreLinks.map((link, idx) => (
              <Link key={idx} to={link.href} className="explore-card animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="explore-icon">{link.icon}</div>
                <div className="explore-label">{link.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Content Section */}
      <section className="home-latest">
        <div className="latest-inner">
          <div className="categories-header text-center animate-fade-in-up">
            <h2>جديد الموقع</h2>
            <p>أحدث ما تم إضافته من دروس وكتب ومقالات</p>
          </div>
          
          <div className="latest-grid">
            
            <div className="latest-section-col animate-fade-in-up">
              <div className="latest-header">
                <h3>جديد الدروس</h3>
                <Link to="/lectures">الكل <FiChevronLeft /></Link>
              </div>
              <div className="latest-list">
                {!l1 && lectures?.data?.map((ls) => (
                  <Link to={`/lectures/${ls._id}`} key={ls._id} className="latest-item">
                    <div className="latest-thumb">
                       {ls.youtubeUrl && <img src={`https://img.youtube.com/vi/${new URL(ls.youtubeUrl).searchParams.get('v')}/mqdefault.jpg`} alt="" />}
                    </div>
                    <div className="latest-info">
                      <div className="latest-title">{ls.title}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="latest-section-col animate-fade-in-up delay-100">
              <div className="latest-header">
                <h3>جديد الكتب</h3>
                <Link to="/books">الكل <FiChevronLeft /></Link>
              </div>
              <div className="latest-list">
                {!l3 && books?.data?.map((bk) => (
                  <Link to={`/books/${bk._id}`} key={bk._id} className="latest-item">
                    <div className="latest-thumb book">
                       {bk.coverImage && <img src={getStorageUrl(bk.coverImage)} alt="" />}
                    </div>
                    <div className="latest-info">
                      <div className="latest-title">{bk.title}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="latest-section-col animate-fade-in-up delay-200">
              <div className="latest-header">
                <h3>جديد المقالات</h3>
                <Link to="/articles">الكل <FiChevronLeft /></Link>
              </div>
              <div className="latest-list">
                {!l2 && articles?.data?.map((ar) => (
                  <Link to={`/articles/${ar._id}`} key={ar._id} className="latest-item">
                    <div className="latest-thumb">
                       {ar.image && <img src={getStorageUrl(ar.image)} alt="" />}
                    </div>
                    <div className="latest-info">
                      <div className="latest-title">{ar.title}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="home-contact-cta">
        <div className="container animate-fade-in-up">
          <h2>التواصل والتسجيل</h2>
          <p>للاشتراك في البرامج العلمية، والحصول على التنبيهات للدروس المباشرة والإصدارات الجديدة، يسعدنا تواصلكم معنا.</p>
          <Link to="/contact" className="btn-cta-gold">
            <FiPhoneCall style={{ margin: '0 0 -2px 8px' }} />
            تواصل معنا الآن
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;
