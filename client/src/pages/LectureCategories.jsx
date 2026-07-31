import { Link } from 'react-router-dom';
import { FiBookOpen, FiBookmark, FiChevronLeft } from 'react-icons/fi';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useFetch } from '../hooks/useFetch';
import './LectureCategories.css';

const LectureCategories = () => {
  const { settings } = useSiteSettings();
  const { data: coursesRes } = useFetch('/lectures/courses');
  const categories = settings.categories || [];
  const page = settings.lectureCategoriesPage || {};

  // Derive real lesson totals per category instead of trusting the hand-typed `count`
  // in site settings, which drifts as soon as lectures are added or moved. Once the
  // courses have loaded, a category missing from the map genuinely has no lessons —
  // falling back to `count` there would resurrect a stale number.
  const coursesLoaded = Array.isArray(coursesRes?.data);
  const lessonsByCategory = (coursesRes?.data || []).reduce((acc, course) => {
    acc[course.category] = (acc[course.category] || 0) + (course.lessonsCount || 0);
    return acc;
  }, {});

  // مقرأة السنة books live under their own category (for isnad matching) but the
  // الحديث browse page folds them in, so mirror that here for a consistent badge count.
  const sunnahBookNames = (settings.sunnahBooks || []).map((b) => b.name);
  if (coursesLoaded) {
    lessonsByCategory['الحديث'] = sunnahBookNames.reduce(
      (sum, name) => sum + (lessonsByCategory[name] || 0),
      lessonsByCategory['الحديث'] || 0
    );
  }

  // Before the fetch resolves, show the settings value so the badge doesn't flash "0".
  const lessonCount = (category) =>
    coursesLoaded ? lessonsByCategory[category.name] || 0 : category.count ?? 0;

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
                  {lessonCount(c)} دروس ومجالس
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
