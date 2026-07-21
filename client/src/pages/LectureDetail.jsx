import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { FiCheckCircle } from 'react-icons/fi';
import VideoPlayer from '../components/lectures/VideoPlayer';
import Loader from '../components/ui/Loader';
import './LectureDetail.css';

const LectureDetail = () => {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/lectures/${id}`);

  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (id) {
      setCompleted(localStorage.getItem(`completed_lecture_${id}`) === 'true');
    }
  }, [id]);

  const toggleCompleted = () => {
    const nextState = !completed;
    setCompleted(nextState);
    localStorage.setItem(`completed_lecture_${id}`, String(nextState));
  };

  const lecture = data?.data;
  const related = data?.related || [];

  // Fetch category/series lessons for sidebar list
  const categoryName = lecture?.category || '';
  const seriesName = lecture?.series || '';
  const { data: catData } = useFetch(
    categoryName ? `/lectures?category=${encodeURIComponent(categoryName)}` : null
  );

  if (loading) return <Loader />;
  if (error || !lecture) return <div className="alert alert-error">{error || 'الدرس غير موجود'}</div>;

  // Extract youtubeId
  let youtubeId = lecture.youtubeId;

  // Build strictly isolated playlist for THIS BOOK ONLY
  let playlist = [];
  if (catData?.data?.length) {
    playlist = catData.data.filter((item) => !seriesName || item.series === seriesName || item.category === categoryName);
  }
  if (!playlist.length) {
    playlist = [lecture, ...related.filter((r) => r.category === categoryName)];
  }
  // Ensure current lecture is present in playlist
  if (!playlist.some((p) => p._id === lecture._id)) {
    playlist.unshift(lecture);
  }

  return (
    <div className="lecture-page-wrapper">
      {/* Top Banner */}
      <div className="lecture-header-banner">
        <div className="lecture-banner-inner">
          <div className="banner-breadcrumbs">
            <Link to="/">الرئيسية</Link> <span>/</span> <Link to="/lectures">الدروس والدورات</Link>
          </div>
          <h1 className="banner-title">الدروس والدورات</h1>
          <p className="banner-desc">
            مكتبة صوتية ومرئية للدروس والدورات العلمية والشرعية للشيخ أبو عبيدة شعبان العودة، مصنّفة بحسب الموضوع.
          </p>
        </div>
      </div>

      <div className="lecture-container">
        {/* Back Link */}
        <div className="back-link-wrapper">
          <Link to="/lectures" className="back-link">
            → الرجوع لقائمة الدروس
          </Link>
        </div>

        {/* Content Layout */}
        <div className="lecture-content-layout">
          {/* Main Video Section (Left / Center) */}
          <div className="lecture-main-area">
            <h2 className="lecture-main-title">{lecture.title}</h2>

            <div className="lecture-video-box">
              <VideoPlayer youtubeId={youtubeId} youtubeUrl={lecture.youtubeUrl} title={lecture.title} />
            </div>

            <div className="lecture-action-center">
              <button 
                className={`btn-completed ${completed ? 'completed' : ''}`}
                onClick={toggleCompleted}
              >
                <FiCheckCircle style={{ fontSize: '1.25rem' }} />
                {completed ? 'تم إكمال الدرس ✓' : 'أكملت الدرس'}
              </button>
            </div>
          </div>

          {/* Numbered Lessons Sidebar (Right side in RTL) */}
          <aside className="lecture-playlist-sidebar">
            <div className="playlist-card">
              <h3 className="playlist-category-title">
                {seriesName || lecture.category || 'فهرس الكتاب'}
              </h3>
              
              <div className="playlist-items-list">
                {playlist.map((item, idx) => {
                  const isCurrent = item._id === lecture._id;
                  const itemNum = idx + 1;
                  return (
                    <Link
                      key={item._id}
                      to={`/lectures/${item._id}`}
                      className={`playlist-item ${isCurrent ? 'active' : ''}`}
                    >
                      <div className="playlist-item-title">{item.title}</div>
                      <div className="playlist-item-badge">{itemNum}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default LectureDetail;
