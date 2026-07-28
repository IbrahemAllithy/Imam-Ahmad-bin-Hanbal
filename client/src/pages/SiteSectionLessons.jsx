import { Link } from 'react-router-dom';
import { FiVideo, FiBookmark, FiChevronLeft } from 'react-icons/fi';
import { useFetch } from '../hooks/useFetch';
import { getSectionById } from '../utils/siteSections';
import Loader from '../components/ui/Loader';
import './LectureCategories.css';

const SiteSectionLessons = ({ sectionId }) => {
  const section = getSectionById(sectionId);
  const { data, loading, error } = useFetch('/lectures/courses', {
    category: section?.name,
  });

  if (!section) return null;
  const courses = data?.data || [];

  return (
    <div className="categories-page">
      <div className="categories-hero">
        <div className="categories-hero-inner">
          <div className="list-breadcrumb" style={{ marginBottom: '15px' }}>
            <Link to="/">الرئيسية</Link>
            <span>/</span>
            <Link to={section.path}>{section.name}</Link>
            <span>/</span>
            <span className="current">الدروس</span>
          </div>
          <h1>دروس {section.name}</h1>
          <p>اضغط على أي دورة لتصفح دروسها</p>
        </div>
      </div>

      <div className="categories-content">
        {loading && <Loader />}
        {error && <div className="alert alert-error">{error}</div>}
        {!loading && !error && (
          courses.length ? (
            <div className="categories-grid-modern">
              {courses.map((c) => (
                <Link
                  to={`/courses/${encodeURIComponent(c.seriesName)}`}
                  key={c.seriesName}
                  className="category-card-modern"
                >
                  <div className="cat-card-top">
                    <div className="cat-icon-box">
                      <FiVideo />
                    </div>
                    <span className="cat-count-badge">
                      <FiBookmark style={{ margin: '0 0 -2px 4px' }} />
                      {c.lessonsCount} درسًا
                    </span>
                  </div>

                  <div className="cat-card-center">
                    <h3>{c.seriesName}</h3>
                  </div>

                  <div className="cat-card-bottom">
                    <span>تصفح دروس هذه الدورة</span>
                    <FiChevronLeft className="cat-arrow" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="sunnah-empty">لا توجد دروس مضافة في هذا القسم حتى الآن.</p>
          )
        )}
      </div>
    </div>
  );
};

export default SiteSectionLessons;
