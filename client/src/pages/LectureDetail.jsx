import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { FiCheckCircle, FiChevronLeft } from 'react-icons/fi';
import VideoPlayer from '../components/lectures/VideoPlayer';
import Loader from '../components/ui/Loader';
import './LectureDetail.css';

const LectureDetail = () => {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/lectures/${id}`);

  const [completedMap, setCompletedMap] = useState({});

  useEffect(() => {
    const map = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('completed_lecture_')) {
        const itemKey = key.replace('completed_lecture_', '');
        map[itemKey] = localStorage.getItem(key) === 'true';
      }
    }
    setCompletedMap(map);
  }, [id]);

  const toggleCompleted = () => {
    const nextState = !completedMap[id];
    localStorage.setItem(`completed_lecture_${id}`, String(nextState));
    setCompletedMap((prev) => ({ ...prev, [id]: nextState }));
  };

  const lecture = data?.data;
  const related = data?.related || [];

  const categoryName = lecture?.category || '';
  const seriesName = lecture?.series || '';
  const { data: catData } = useFetch(
    categoryName ? `/lectures?category=${encodeURIComponent(categoryName)}` : null
  );

  if (loading) return <Loader />;
  if (error || !lecture) return <div className="alert alert-error">{error || 'الدرس غير موجود'}</div>;

  let youtubeId = lecture.youtubeId;

  // Build playlist
  let playlist = [];
  if (catData?.data?.length) {
    playlist = catData.data.filter((item) => !seriesName || item.series === seriesName || item.category === categoryName);
  }
  if (!playlist.length) {
    playlist = [lecture, ...related.filter((r) => r.category === categoryName)];
  }
  if (!playlist.some((p) => p._id === lecture._id)) {
    playlist.unshift(lecture);
  }

  // Find index of current lecture and next lecture
  const currentIndex = playlist.findIndex((p) => p._id === lecture._id);
  const nextLecture = playlist[currentIndex + 1] || null;

  // Compute progress for this course
  const completedCount = playlist.filter((p) => completedMap[p._id]).length;
  const progressPercent = playlist.length ? Math.round((completedCount / playlist.length) * 100) : 0;
  const isCurrentDone = completedMap[lecture._id];

  return (
    <div className="lecture-page-wrapper">
      {/* Top Header Progress Bar (Image 3 Top Bar) */}
      <div className="lecture-progress-topbar">
        <div className="progress-bar-inner">
          <div className="progress-status-badge">
            {progressPercent}% مكتمل ({completedCount}/{playlist.length} عدد الخطوات)
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      <div className="lecture-container">
        {/* Content Layout */}
        <div className="lecture-content-layout">
          {/* Main Video Area (Left in RTL) */}
          <div className="lecture-main-area">
            <h1 className="lecture-main-title">{lecture.title}</h1>

            {/* Breadcrumb & Status Tag */}
            <div className="lecture-sub-meta">
              {isCurrentDone && <span className="status-pill-completed">مكتمل</span>}
              <div className="lecture-meta-breadcrumbs">
                <Link to="/lectures/list">الدروس</Link>
                <span>&gt;</span>
                <Link to={`/courses/${encodeURIComponent(seriesName || categoryName)}`}>
                  {seriesName || categoryName}
                </Link>
                <span>&gt;</span>
                <span className="current">{lecture.title}</span>
              </div>
            </div>

            {/* Video Player Box */}
            <div className="lecture-video-box">
              <VideoPlayer youtubeId={youtubeId} youtubeUrl={lecture.youtubeUrl} title={lecture.title} />
            </div>

            {/* Bottom Action Bar (Matching Image 3: وضع كغير مكتمل + الدرس التالي) */}
            <div className="lecture-bottom-actions">
              <button
                className={`btn-toggle-status ${isCurrentDone ? 'is-done' : ''}`}
                onClick={toggleCompleted}
              >
                <FiCheckCircle />
                {isCurrentDone ? 'وضع كغير مكتمل' : 'وضع كمكتمل'}
              </button>

              {nextLecture ? (
                <Link to={`/lectures/${nextLecture._id}`} className="btn-next-lecture">
                  الدرس التالي <FiChevronLeft style={{ margin: '0 4px -2px 0' }} />
                </Link>
              ) : (
                <span className="btn-next-lecture disabled">الدرس الأخير في الدورة</span>
              )}
            </div>
          </div>

          {/* Right Playlist Sidebar (Image 3 Right Side) */}
          <aside className="lecture-playlist-sidebar">
            <div className="playlist-card">
              <h3 className="playlist-category-title">
                {seriesName || categoryName}
              </h3>

              <div className="playlist-items-list">
                {playlist.map((item, idx) => {
                  const isCurrent = item._id === lecture._id;
                  const itemDone = completedMap[item._id];
                  return (
                    <Link
                      key={item._id}
                      to={`/lectures/${item._id}`}
                      className={`playlist-item ${isCurrent ? 'active' : ''} ${itemDone ? 'item-done' : ''}`}
                    >
                      <div className="playlist-item-title">{item.title}</div>
                      <div className={`playlist-item-check ${itemDone ? 'checked' : ''}`}>
                        <FiCheckCircle />
                      </div>
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
