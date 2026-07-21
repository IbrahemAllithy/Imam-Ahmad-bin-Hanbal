import { Link } from 'react-router-dom';
import { FiBookOpen, FiPlayCircle } from 'react-icons/fi';
import './SeriesCard.css';

const SeriesCard = ({ seriesName, category, lessonsCount, firstLectureId, thumbnail }) => {
  return (
    <Link to={`/lectures/${firstLectureId}`} className="series-card">
      <div className="series-card-top">
        <div className="series-icon-badge">
          <FiBookOpen />
        </div>
        <span className="series-cat-label">{category}</span>
      </div>

      <div className="series-card-center">
        <h3 className="series-name">{seriesName}</h3>
        <p className="series-sub">شرح لفضيلة الشيخ شعبان العودة</p>
      </div>

      <div className="series-card-bottom">
        <span className="series-lessons-count">{lessonsCount} {lessonsCount === 1 ? 'درس' : 'دروس'}</span>
        <span className="series-start-link">
          عرض الدروس <FiPlayCircle style={{ margin: '0 4px -2px 0' }} />
        </span>
      </div>
    </Link>
  );
};

export default SeriesCard;
