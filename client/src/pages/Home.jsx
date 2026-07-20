import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { sheikh, logo } from '../assets';
import { getStorageUrl } from '../services/api';
import './Home.css';

const quickLinks = [
  { label: 'الدروس', letter: 'د', href: '/lectures' },
  { label: 'الكتب', letter: 'ك', href: '/books' },
  { label: 'المقالات', letter: 'م', href: '/articles' },
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
  'مرحباً بكم في الموقع الرسمي الجديد.',
];

const Home = () => {
  const { data: lectures, loading: l1 } = useFetch('/lectures', { limit: 6 });
  const { data: articles, loading: l2 } = useFetch('/articles', { limit: 6 });
  const { data: books, loading: l3 } = useFetch('/books', { limit: 6 });

  return (
    <div className="home-wrapper">
      <section className="home-hero">
        <div className="hero-pattern"></div>
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-badge">مجمع الإمام أحمد</div>
            <h1 className="hero-title">فضيلة الشيخ أبو عبيدة شعبان العودة</h1>
            <p className="hero-desc">دروس وكتب ومقالات مبوّبة بعناية في العقيدة والفقه والحديث والتفسير، إضافة إلى مقرأة السنة وبرامج التعلّم عن بُعد.</p>
            <div className="hero-actions">
              <Link to="/lectures" className="hero-btn-primary">تصفح الدروس</Link>
              <Link to="/books" className="hero-btn-outline">تصفح الكتب</Link>
            </div>
          </div>
          <div className="hero-visual">
            <img src={sheikh} alt="الشيخ شعبان العودة" className="hero-image" />
          </div>
        </div>
      </section>

      <section className="home-quicklinks">
        <div className="quicklinks-inner">
          <div className="quicklinks-grid">
            {quickLinks.map((ql, idx) => (
              <Link key={idx} to={ql.href} className="quicklink-card">
                <div className="quicklink-icon">
                  <span>{ql.letter}</span>
                </div>
                <span className="quicklink-label">{ql.label}</span>
              </Link>
            ))}
          </div>
          <div className="announcements-card">
            <div className="announcements-title">إعلانات عن الدروس</div>
            {announcements.map((an, idx) => (
              <div key={idx} className="announcement-item">{an}</div>
            ))}
            <span className="announcements-footer">يتحدّث تلقائيًا</span>
          </div>
        </div>
      </section>

      <section className="home-categories">
        <div className="categories-inner">
          <div className="categories-header">
            <h2>العلوم الشرعية</h2>
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
      </section>

      <section className="home-latest">
        <div className="latest-inner">

          <div className="latest-content">
            
            <div className="latest-section">
              <div className="latest-header">
                <h2>جديد الدروس</h2>
                <Link to="/lectures">عرض الكل ‹</Link>
              </div>
              <div className="latest-scroll">
                {!l1 && lectures?.data?.map((ls) => (
                  <Link to={`/lectures/${ls._id}`} key={ls._id} className="latest-card latest-lecture">
                    <div className="latest-thumb video-thumb">
                       {ls.youtubeUrl && <img src={`https://img.youtube.com/vi/${new URL(ls.youtubeUrl).searchParams.get('v')}/mqdefault.jpg`} alt="" />}
                    </div>
                    <div className="latest-info">
                      <div className="latest-title">{ls.title}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="latest-section">
              <div className="latest-header">
                <h2>جديد الكتب</h2>
                <Link to="/books">عرض الكل ‹</Link>
              </div>
              <div className="latest-scroll">
                {!l3 && books?.data?.map((bk) => (
                  <Link to={`/books/${bk._id}`} key={bk._id} className="latest-book-card">
                    <div className="latest-thumb book-thumb">
                       {bk.coverImage && <img src={getStorageUrl(bk.coverImage)} alt="" />}
                    </div>
                    <div className="latest-title">{bk.title}</div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="latest-section">
              <div className="latest-header">
                <h2>جديد المقالات</h2>
                <Link to="/articles">عرض الكل ‹</Link>
              </div>
              <div className="latest-scroll">
                {!l2 && articles?.data?.map((ar) => (
                  <Link to={`/articles/${ar._id}`} key={ar._id} className="latest-card latest-article">
                    <div className="latest-thumb article-thumb">
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

      <section className="home-community">
        <h2>انضمّ إلى مجتمع طلاب العلم</h2>
        <p>سجّل الآن مجانًا وتابع دروسك وكتبك المفضلة أولًا بأول</p>
        <button className="btn-join">سجّل الآن مجانًا</button>
      </section>
    </div>
  );
};

export default Home;
