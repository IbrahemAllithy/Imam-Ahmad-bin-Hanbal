import { Link } from 'react-router-dom';
import { getYoutubeThumbnail } from '../../utils/helpers';
import './LectureCard.css';

const LectureCard = ({ lecture }) => {
  const accent = '#2563eb';
  return (
    <Link to={`/lectures/${lecture._id}`} className="lecture-card">
      <div className="lecture-thumb">
        {lecture.youtubeUrl ? (
          <img
            src={`https://img.youtube.com/vi/${new URL(lecture.youtubeUrl).searchParams.get('v')}/mqdefault.jpg`}
            alt={lecture.title}
            loading="lazy"
          />
        ) : (
          <span>صورة الدرس</span>
        )}
      </div>
      <div className="lecture-body">
        <div className="lecture-meta">
          <span className="lecture-cat" style={{ color: accent }}>{lecture.category}</span>
          <span className="lecture-level">{lecture.level || 'عام'}</span>
        </div>
        <div className="lecture-title">{lecture.title}</div>
        <div className="lecture-footer">
          <span>{lecture.teacher || 'الشيخ شعبان العودة'}</span>
          <span>{lecture.duration || '40 د'}</span>
        </div>
      </div>
    </Link>
  );
};

export default LectureCard;
