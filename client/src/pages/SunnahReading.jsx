import { Link } from 'react-router-dom';
import './LectureCategories.css';

const SUNNAH_BOOKS_PATH = '/sunnah-reading/books';

const SunnahReading = () => {
  return (
    <div className="categories-page">
      <div className="categories-hero">
        <div className="categories-hero-inner">
          <div className="list-breadcrumb" style={{ marginBottom: '15px' }}>
            <Link to="/">الرئيسية</Link>
            <span>/</span>
            <span className="current">مقرأة السنة</span>
          </div>
          <h1>مقرأة السنة</h1>
        </div>
      </div>

      <div className="categories-content">
        <div className="sunnah-subscribe-card">
          <h3>
            للاشتراك في مقرأة السنة والحصول على إسناد متصل{' '}
            <Link className="sunnah-inline-link" to={SUNNAH_BOOKS_PATH}>
              (اضغط هنا)
            </Link>
          </h3>
        </div>
      </div>
    </div>
  );
};

export default SunnahReading;
