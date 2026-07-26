import { Link } from 'react-router-dom';
import { FiBookOpen, FiBookmark, FiChevronLeft } from 'react-icons/fi';
import { useSiteSettings } from '../context/SiteSettingsContext';
import './LectureCategories.css';

const SunnahReading = () => {
  const { settings } = useSiteSettings();
  const books = settings.sunnahBooks || [];

  return (
    <div className="categories-page">
      <div className="categories-hero">
        <div className="categories-hero-inner">
          <div className="list-breadcrumb" style={{ marginBottom: '15px' }}>
            <Link to="/">الرئيسية</Link>
            <span>/</span>
            <span className="current">قراءة السنة</span>
          </div>
          <h1>قراءة السنة</h1>
          <p>تصفّح كتب السنة المشروحة، مبوّبة كل كتاب على حدة</p>
        </div>
      </div>

      <div className="categories-content">
        <div className="categories-section-header">
          <h2>كتب السنة</h2>
          <p>اضغط على أي كتاب لتصفح دروسه وشروحه</p>
        </div>

        {books.length ? (
          <div className="categories-grid-modern">
            {books.map((b) => (
              <Link
                to={`/lectures/list?category=${encodeURIComponent(b.name)}`}
                key={b.id || b.name}
                className="category-card-modern"
              >
                <div className="cat-card-top">
                  <div className="cat-icon-box">
                    <FiBookOpen />
                  </div>
                  <span className="cat-count-badge">
                    <FiBookmark style={{ margin: '0 0 -2px 4px' }} />
                    {b.count} درسًا
                  </span>
                </div>

                <div className="cat-card-center">
                  <h3>{b.name}</h3>
                  <p>شروح ودروس مفرغة في {b.name}</p>
                </div>

                <div className="cat-card-bottom">
                  <span>تصفح دروس هذا الكتاب</span>
                  <FiChevronLeft className="cat-arrow" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="platform-empty">لا توجد أقسام مضافة بعد</p>
        )}
      </div>
    </div>
  );
};

export default SunnahReading;
