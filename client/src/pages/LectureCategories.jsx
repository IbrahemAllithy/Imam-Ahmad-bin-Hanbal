import { Link } from 'react-router-dom';
import { FiBookOpen, FiBookmark, FiChevronLeft } from 'react-icons/fi';
import { useSiteSettings } from '../context/SiteSettingsContext';
import './LectureCategories.css';

const LectureCategories = () => {
  const { settings } = useSiteSettings();
  const categories = settings.categories || [];
  const page = settings.lectureCategoriesPage || {};

  return (
    <div className="categories-page">
      <div className="categories-hero">
        <div className="categories-hero-inner">
          <div className="list-breadcrumb" style={{ marginBottom: '15px' }}>
            <Link to="/">الرئيسية</Link>
            <span>/</span>
            <span className="current">العلوم والدورات الشرعية</span>
          </div>
          <h1>{page.headerTitle}</h1>
          <p>{page.headerSubtitle}</p>
        </div>
      </div>

      <div className="categories-content">
        <div className="categories-section-header">
          <h2>{page.sectionTitle}</h2>
          <p>{page.sectionSubtitle}</p>
        </div>

        <div className="categories-grid-modern">
          {categories.map((c) => (
            <Link
              to={`/lectures/list?category=${encodeURIComponent(c.name)}`}
              key={c.id || c.name}
              className="category-card-modern"
            >
              <div className="cat-card-top">
                <div className="cat-icon-box">
                  <FiBookOpen />
                </div>
                <span className="cat-count-badge">
                  <FiBookmark style={{ margin: '0 0 -2px 4px' }} />
                  {c.count} دروس ومجالس
                </span>
              </div>

              <div className="cat-card-center">
                <h3>{c.name}</h3>
                <p>دورات وشروح معتمدة ومفرغة في علم {c.name}</p>
              </div>

              <div className="cat-card-bottom">
                <span>تصفح كتب ودورات هذا العلم</span>
                <FiChevronLeft className="cat-arrow" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LectureCategories;
