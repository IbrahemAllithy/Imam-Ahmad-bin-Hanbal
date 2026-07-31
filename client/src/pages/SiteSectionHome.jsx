import { Link } from 'react-router-dom';
import { FiBook, FiVideo, FiChevronLeft } from 'react-icons/fi';
import { getSectionById } from '../utils/siteSections';
import './LectureCategories.css';

const SiteSectionHome = ({ sectionId }) => {
  const section = getSectionById(sectionId);
  if (!section) return null;

  return (
    <div className="categories-page">
      <div className="categories-hero">
        <div className="categories-hero-inner">
          <div className="list-breadcrumb" style={{ marginBottom: '15px' }}>
            <Link to="/">الرئيسية</Link>
            <span>/</span>
            <span className="current">{section.name}</span>
          </div>
          <h1>{section.name}</h1>
          <p>اختر القسم الذي تريد تصفحه</p>
        </div>
      </div>

      <div className="categories-content">
        <div className="categories-grid-modern">
          <Link to={`${section.path}/books`} className="category-card-modern">
            <div className="cat-card-top">
              <div className="cat-icon-box">
                <FiBook />
              </div>
            </div>
            <div className="cat-card-center">
              <h3>الكتب</h3>
            </div>
            <div className="cat-card-bottom">
              <span>تصفح الكتب</span>
              <FiChevronLeft className="cat-arrow" />
            </div>
          </Link>

          <Link to={`${section.path}/lessons`} className="category-card-modern">
            <div className="cat-card-top">
              <div className="cat-icon-box">
                <FiVideo />
              </div>
            </div>
            <div className="cat-card-center">
              <h3>الدروس</h3>
            </div>
            <div className="cat-card-bottom">
              <span>تصفح الدروس</span>
              <FiChevronLeft className="cat-arrow" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SiteSectionHome;
