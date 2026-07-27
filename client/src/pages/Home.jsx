import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { getStorageUrl, getBookCoverUrl } from '../services/api';
import './Home.css';
import {
  FiBook,
  FiFileText,
  FiVideo,
  FiBookOpen,
  FiMonitor,
  FiCheckCircle,
  FiChevronLeft,
  FiPhoneCall,
} from 'react-icons/fi';

const quickLinks = [
  { label: 'الدروس', href: '/lectures', icon: <FiVideo /> },
  { label: 'الكتب', href: '/books', icon: <FiBook /> },
  { label: 'المقالات', href: '/articles', icon: <FiFileText /> },
  { label: 'مقرأة السنة', href: '/sunnah-reading', icon: <FiBookOpen /> },
  { label: 'تعلم عن بعد', href: '/distance-learning', icon: <FiMonitor /> },
];

const Home = () => {
  const { data: lectures, loading: l1 } = useFetch('/lectures', { limit: 4 });
  const { data: articles, loading: l2 } = useFetch('/articles', { limit: 4 });
  const { data: books, loading: l3 } = useFetch('/books', { limit: 4 });
  const location = useLocation();
  const { settings, sheikhImage } = useSiteSettings();

  const hero = settings.hero || {};
  const announcements = settings.announcements || [];
  const cta = settings.cta || {};

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <div className="home-wrapper">
      <section className="home-hero">
        <div className="hero-pattern"></div>
        <div className="hero-inner">
          <div className="hero-content animate-fade-in-up">
            <h1 className="hero-title">
              {(hero.title || '').split('\n').map((line, idx, arr) => (
                <span key={idx}>
                  {line}
                  {idx < arr.length - 1 && <br />}
                </span>
              ))}
              <br />
              <span className="hero-honorific">حفظه الله</span>
            </h1>
            <p className="hero-quote">
              المَلائِكَةُ حُرَّاسُ السَّماءِ، وأصحابُ الحَديثِ حُرَّاسُ الأرْضِ
              <span className="hero-quote-author">سُفيانُ الثَّوريُّ رحمه الله</span>
            </p>
          </div>
          <div className="hero-visual animate-fade-in-up delay-200">
            <img src={sheikhImage} alt={settings.branding?.siteName} className="hero-image" />
          </div>
        </div>
      </section>

      <section id="explore" className="home-categories">
        <div className="categories-inner">
          <div className="announcements-sidebar animate-fade-in-up">
            <div className="announcements-title">
              <FiCheckCircle /> إعلانات عن الدروس
            </div>
            <div className="announcements-list">
              {announcements.map((an) => (
                <div key={an} className="announcement-item">{an}</div>
              ))}
            </div>
          </div>

          <div className="categories-main animate-fade-in-up delay-100">
            <div className="categories-header">
              <h2>أقسام الموقع</h2>
              <p>تصفح محتوى الموقع بطريقة سهلة وميسرة</p>
            </div>
            <div className="explore-grid">
              {quickLinks.map((link, idx) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="explore-card animate-fade-in-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="explore-icon">{link.icon}</div>
                  <div className="explore-label">{link.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

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
                <Link to="/lectures">
                  الكل <FiChevronLeft />
                </Link>
              </div>
              <div className="latest-list">
                {!l1 &&
                  lectures?.data?.map((ls) => (
                    <Link to={`/lectures/${ls._id}`} key={ls._id} className="latest-item">
                      <div className="latest-thumb">
                        {ls.youtubeId && (
                          <img
                            src={`https://img.youtube.com/vi/${ls.youtubeId}/mqdefault.jpg`}
                            alt=""
                          />
                        )}
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
                <Link to="/books">
                  الكل <FiChevronLeft />
                </Link>
              </div>
              <div className="latest-list">
                {!l3 &&
                  books?.data?.map((bk) => (
                    <Link to={`/books/${bk._id}`} key={bk._id} className="latest-item">
                      <div className="latest-thumb book">
                        {getBookCoverUrl(bk) && <img src={getBookCoverUrl(bk)} alt="" />}
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
                <Link to="/articles">
                  الكل <FiChevronLeft />
                </Link>
              </div>
              <div className="latest-list">
                {!l2 &&
                  articles?.data?.map((ar) => (
                    <Link to={`/articles/${ar._id}`} key={ar._id} className="latest-item">
                      <div className="latest-thumb">
                        {ar.coverImage && <img src={getStorageUrl(ar.coverImage)} alt="" />}
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

      <section className="home-contact-cta">
        <div className="container animate-fade-in-up">
          <h2>{cta.title}</h2>
          <p>{cta.description}</p>
          <Link to={cta.buttonLink || '/contact'} className="btn-cta-gold">
            <FiPhoneCall style={{ margin: '0 0 -2px 8px' }} />
            {cta.buttonText}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
