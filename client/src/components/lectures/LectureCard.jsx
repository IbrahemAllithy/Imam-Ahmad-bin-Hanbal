import { Link } from 'react-router-dom';
import { extractYoutubeId, getYoutubeThumbnail } from '../../utils/helpers';
import './LectureCard.css';

const LectureCard = ({ lecture, isCompleted }) => {
  const accent = '#2563eb';
  const ytId = lecture?.youtubeId || extractYoutubeId(lecture?.youtubeUrl);
  const thumbUrl = getYoutubeThumbnail(ytId);

  return (
    <Link to={`/lectures/${lecture._id}`} className="lecture-card">
      <div className="lecture-thumb">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={lecture.title}
            loading="lazy"
          />
        ) : (
          <span>صورة الدرس</span>
        )}
        {isCompleted && (
          <div className="completed-badge">
            تم الإكمال ✓
          </div>
        )}
      </div>
      <div className="lecture-body">
        <div className="lecture-meta">
          <span className="lecture-cat" style={{ color: accent }}>{lecture.category}</span>
          <span className="lecture-level">{lecture.series || lecture.level || 'عام'}</span>
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
