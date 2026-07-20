import { Link } from 'react-router-dom';
import { getYoutubeThumbnail } from '../../utils/helpers';
import './LectureCard.css';

const LectureCard = ({ lecture }) => (
  <Link to={`/lectures/${lecture._id}`} className="lecture-card">
    <div className="lecture-thumb">
      <img
        src={getYoutubeThumbnail(lecture.youtubeId)}
        alt={lecture.title}
        loading="lazy"
      />
      <span className="play-icon">▶</span>
    </div>
    <div className="lecture-body">
      <span className="pill">{lecture.category}</span>
      <h3>{lecture.title}</h3>
      {lecture.series && <p className="series">{lecture.series}</p>}
    </div>
  </Link>
);

export default LectureCard;
