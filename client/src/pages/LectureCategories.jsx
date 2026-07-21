import { Link } from 'react-router-dom';
import { FiBookOpen } from 'react-icons/fi';
import { lectureCategories as categories } from '../utils/categories';
import './LectureCategories.css';

const LectureCategories = () => {
  return (
    <div className="categories-page">
      <div className="categories-hero">
        <div className="categories-hero-inner">
          <div className="list-breadcrumb" style={{ marginBottom: '15px' }}>
            <Link to="/">الرئيسية</Link>
            <span>/</span>
            <span className="current">الدروس والدورات</span>
          </div>
          <h1>الدروس والدورات</h1>
          <p>مكتبة صوتية ومرئية للدروس والدورات العلمية والشرعية للشيخ أبو عبيدة شعبان العودة، مصنفة بحسب الموضوع.</p>
        </div>
      </div>
      
      <div className="categories-content">
        <h2>تصفح الدروس حسب التصنيف</h2>
        <div className="categories-grid">
          {categories.map((c) => (
            <Link to={`/lectures/list?category=${c.name}`} key={c.id} className="category-card">
              <div className="cat-icon-wrapper">
                <FiBookOpen className="cat-icon" />
                <div className="cat-dot"></div>
              </div>
              <h3>{c.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LectureCategories;
