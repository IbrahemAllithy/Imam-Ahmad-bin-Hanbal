import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { getStorageUrl } from '../services/api';
import './Home.css';
import {
  FiBook,
  FiFileText,
  FiVideo,
  FiList,
  FiCheckCircle,
  FiChevronLeft,
  FiPhoneCall,
} from 'react-icons/fi';

const exploreIcons = [<FiVideo />, <FiBook />, <FiFileText />, <FiList />];

const Home = () => {
  const { data: lectures, loading: l1 } = useFetch('/lectures', { limit: 4 });
  const { data: articles, loading: l2 } = useFetch('/articles', { limit: 4 });
  const { data: books, loading: l3 } = useFetch('/books', { limit: 4 });
  const location = useLocation();
  const { settings, sheikhImage } = useSiteSettings();

  const hero = settings.hero || {};
  const homeAbout = settings.homeAbout || {};
  const announcements = settings.announcements || [];
  const categories = settings.categories || [];
  const exploreLinks = settings.exploreLinks || [];
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

  const secondaryIsHash = (hero.secondaryCtaLink || '').startsWith('#');

  return (
    <div className="home-wrapper">
      <section className="home-hero">
        <div className="hero-pattern"></div>
        <div className="hero-inner">
          <div className="hero-content animate-fade-in-up">
            <div className="hero-badge">{hero.badge}</div>
            <h1 className="hero-title">
              {(hero.title || '').split('\n').map((line, idx, arr) => (
                <span key={idx}>
                  {line}
                  {idx < arr.length - 1 && <br />}
                </span>
              ))}
            </h1>
            <p className="hero-desc">{hero.description}</p>
            <div className="hero-actions">
              <Link to={hero.primaryCtaLink || '/lectures'} className="btn btn-primary hover-lift">
                {hero.primaryCtaText}
              </Link>
              {secondaryIsHash ? (
                <a href={hero.secondaryCtaLink} className="btn btn-outline hover-lift">
                  {hero.secondaryCtaText}
                </a>
              ) : (
                <Link to={hero.secondaryCtaLink || '/about'} className="btn btn-outline hover-lift">
                  {hero.secondaryCtaText}
                </Link>
              )}
            </div>
          </div>
          <div className="hero-visual animate-fade-in-up delay-200">
            <img src={sheikhImage} alt={settings.branding?.siteName} className="hero-image" />
          </div>
        </div>
      </section>

      <section id="about" className="home-about animate-fade-in-up delay-300">
        <div className="about-inner">
          <div className="about-intro-section">
            <h2 className="about-title">{homeAbout.title}</h2>
            <h3 className="about-subtitle">{homeAbout.subtitle}</h3>
            <ul className="about-bullets">
              {(homeAbout.bullets || []).map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>

          <div className="home-stats-grid">
            {(homeAbout.stats || []).map((stat) => (
              <div className="stat-card" key={stat.label}>
                <div className="stat-num">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-categories">
        <div className="categories-inner">
          <div className="announcements-sidebar animate-fade-in-up">
            <div className="announcements-title">
              <FiCheckCircle /> إعلانات الموقع
            </div>
            <div className="announcements-list">
              {announcements.map((an) => (
                <div key={an} className="announcement-item">{an}</div>
              ))}
            </div>
          </div>

          <div className="categories-main animate-fade-in-up delay-100">
            <div className="categories-header">
              <h2>الدورات والبرامج</h2>
              <p>اختر العلم الذي تريد البدء بدراسته</p>
            </div>
            <div className="categories-grid">
              {categories.map((cat) => (
                <Link
                  key={cat.id || cat.name}
                  to={`/lectures?category=${cat.name}`}
                  className="category-card"
                >
                  <div className="category-icon">
                    <span>{cat.letter || cat.name?.[0]}</span>
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

      <section id="explore" className="home-explore">
        <div className="explore-inner">
          <div className="categories-header text-center animate-fade-in-up">
            <h2>استكشف خيارات التعلّم</h2>
            <p>تصفح محتوى الموقع بطريقة سهلة وميسرة</p>
          </div>
          <div className="explore-grid">
            {exploreLinks.map((link, idx) => (
              <Link
                key={`${link.href}-${link.label}`}
                to={link.href}
                className="explore-card animate-fade-in-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="explore-icon">{exploreIcons[idx % exploreIcons.length]}</div>
                <div className="explore-label">{link.label}</div>
              </Link>
            ))}
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
