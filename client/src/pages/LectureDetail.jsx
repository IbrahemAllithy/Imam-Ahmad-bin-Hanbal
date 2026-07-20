import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import VideoPlayer from '../components/lectures/VideoPlayer';
import LectureCard from '../components/lectures/LectureCard';
import Loader from '../components/ui/Loader';
import './ArticleDetail.css';
import './LectureDetail.css';

const LectureDetail = () => {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/lectures/${id}`);

  if (loading) return <Loader />;
  if (error) return <div className="alert alert-error">{error}</div>;

  const { data: lecture, related } = data;
  const accent = '#2563eb';
  const teacherInitial = lecture.teacher ? lecture.teacher.charAt(0) : 'ش';
  const teacherName = lecture.teacher || 'الشيخ شعبان العودة';
  
  // Extract youtubeId correctly
  let youtubeId = lecture.youtubeId;
  if (!youtubeId && lecture.youtubeUrl) {
      try {
        youtubeId = new URL(lecture.youtubeUrl).searchParams.get('v');
      } catch (e) {
          // ignore
      }
  }

  return (
    <div className="article-page-wrapper">
      <div className="article-breadcrumb">
        <Link to="/">الرئيسية</Link>
        <span>/</span>
        <Link to="/lectures">الدروس</Link>
        <span>/</span>
        <span className="current">{lecture.title}</span>
      </div>

      <div className="article-detail-layout">
        <div className="lecture-video-container">
          <VideoPlayer youtubeId={youtubeId} title={lecture.title} />
        </div>
        
        <div className="article-columns">
          <div className="article-main">
            <div className="article-cat" style={{ color: accent }}>{lecture.category}</div>
            <h1 className="article-title">{lecture.title}</h1>
            <div className="article-meta">
              <div className="author-avatar" style={{ background: accent }}>{teacherInitial}</div>
              <span>{teacherName}</span>
              <span>·</span>
              <span>{lecture.duration || '40 دقيقة'}</span>
            </div>
            
            {lecture.description && (
              <div className="article-content">
                <p>{lecture.description}</p>
              </div>
            )}
          </div>
          
          <aside className="article-sidebar">
            <div className="author-card">
              <div className="author-avatar-lg" style={{ background: accent }}>{teacherInitial}</div>
              <div className="author-name">{teacherName}</div>
              <div className="author-desc">مجمع الإمام أحمد بن حنبل.</div>
            </div>
            
            {related?.length > 0 && (
              <div className="related-articles">
                <div className="related-title">دروس ذات صلة</div>
                <div className="related-list">
                  {related.map((ra) => (
                    <Link key={ra._id} to={`/lectures/${ra._id}`} className="related-link">
                      {ra.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default LectureDetail;
