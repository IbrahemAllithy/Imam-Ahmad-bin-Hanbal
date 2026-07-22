import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { FiCheckCircle, FiBookOpen, FiVolume2, FiHelpCircle, FiFileText, FiExternalLink } from 'react-icons/fi';
import VideoPlayer from '../components/lectures/VideoPlayer';
import Loader from '../components/ui/Loader';
import './LectureDetail.css';

const LectureDetail = () => {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/lectures/${id}`);

  const [completedMap, setCompletedMap] = useState({});
  const [showQuizModal, setShowQuizModal] = useState(false);

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
  const pdfUrl = lecture.pdfUrl || 'https://archive.org/embed/20230616_20230616_1912';
  const audioUrl = lecture.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

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

  const isCurrentDone = completedMap[lecture._id];

  return (
    <div className="sketch-lecture-page">
      {/* Top Breadcrumb & Header */}
      <div className="sketch-page-header">
        <div className="sketch-header-inner">
          <div className="sketch-breadcrumbs">
            <Link to="/">الرئيسية</Link> <span>/</span> <Link to="/lectures">الدروس والدورات</Link>
          </div>
          <h1 className="sketch-header-title">الدروس والدورات</h1>
          <p className="sketch-header-subtitle">
            مكتبة صوتية ومرئية ومقروءة للدروس والدورات العلمية لفضيلة الشيخ شعبان العودة.
          </p>
        </div>
      </div>

      <div className="sketch-container">
        {/* Back Link */}
        <div className="sketch-back-row">
          <Link to="/lectures/list" className="sketch-back-link">
            &rarr; الرجوع لقائمة الدروس
          </Link>
        </div>

        {/* Lesson Title Above Grid */}
        <h2 className="sketch-lesson-title">{lecture.title}</h2>

        {/* Main Grid: Video/Audio (Right), Book PDF (Left), Sidebar (Far Right) */}
        <div className="sketch-grid-layout">
          {/* Main Content Area (2 Columns: Book PDF + Video/Audio) */}
          <div className="sketch-media-columns">
            {/* Book PDF Column (Left Box matching handwritten drawing & screenshot) */}
            <div className="sketch-book-box">
              <div className="sketch-box-header">
                <FiBookOpen />
                <span>الكتاب PDF</span>
              </div>
              <div className="sketch-pdf-container">
                <iframe
                  src={pdfUrl}
                  title="الكتاب PDF"
                  className="sketch-pdf-iframe"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="sketch-pdf-footer">
                <a
                  href="https://archive.org/details/20230616_20230616_1912/mode/2up"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-pdf-external"
                >
                  <FiExternalLink /> فتح الكتاب في نافذة مستقلة
                </a>
              </div>
            </div>

            {/* Video & Audio Column (Right Box matching handwritten drawing & screenshot) */}
            <div className="sketch-video-box-col">
              {/* YouTube Video Player */}
              <div className="sketch-video-wrapper">
                <VideoPlayer youtubeId={youtubeId} youtubeUrl={lecture.youtubeUrl} title={lecture.title} />
              </div>

              {/* Audio Player (صوتي) */}
              <div className="sketch-audio-box">
                <div className="sketch-audio-header">
                  <FiVolume2 />
                  <span>صوتي (الاستماع للدرس)</span>
                </div>
                <audio controls className="sketch-audio-player" src={audioUrl}>
                  متصفحك لا يدعم مشغل الصوت.
                </audio>
              </div>
            </div>
          </div>

          {/* Sidebar (قائمة الدروس المرقّمة) */}
          <aside className="sketch-sidebar">
            <div className="sketch-playlist-card">
              <h3 className="sketch-playlist-title">{categoryName || seriesName}</h3>
              <div className="sketch-playlist-list">
                {playlist.map((item, idx) => {
                  const isCurrent = item._id === lecture._id;
                  const itemDone = completedMap[item._id];
                  return (
                    <Link
                      key={item._id}
                      to={`/lectures/${item._id}`}
                      className={`sketch-playlist-item ${isCurrent ? 'active' : ''}`}
                    >
                      <span className="sketch-item-title">{item.title}</span>
                      <span className={`sketch-item-num ${itemDone ? 'done' : ''}`}>
                        {idx + 1}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>

        {/* Middle Section: (محتوى + اختبر نفسك) */}
        <div className="sketch-middle-row">
          {/* Quiz Box (اختبر نفسك - Left) */}
          <div className="sketch-quiz-box">
            <h4>اختبر نفسك</h4>
            <button
              className="btn-quiz-start"
              onClick={() => setShowQuizModal(true)}
            >
              <FiHelpCircle style={{ margin: '0 0 -2px 6px' }} />
              أسئلة خاصة بالدرس
            </button>
          </div>

          {/* Content Summary Box (محتوى - Right) */}
          <div className="sketch-summary-box">
            <h4>محتوى الدرس والتفريغ</h4>
            <div className="sketch-content-line">
              <div className="sketch-line-fill" style={{ width: isCurrentDone ? '100%' : '40%' }}></div>
            </div>
          </div>
        </div>

        {/* Bottom Action Button (أكملت الدرس) */}
        <div className="sketch-bottom-action">
          <button
            className={`btn-sketch-completed ${isCurrentDone ? 'completed' : ''}`}
            onClick={toggleCompleted}
          >
            <FiCheckCircle style={{ fontSize: '1.25rem' }} />
            {isCurrentDone ? 'تم إكمال الدرس ✓' : 'أكملت الدرس'}
          </button>
        </div>
      </div>

      {/* Quiz Questions Modal */}
      {showQuizModal && (
        <div className="sketch-modal-overlay" onClick={() => setShowQuizModal(false)}>
          <div className="sketch-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>أسئلة واختبار الدرس</h3>
            <p className="sketch-modal-sub">اختبر معلوماتك وفهمك لمحتوى هذا المجلس المبارك:</p>

            <ol className="quiz-questions-list">
              {(lecture.quizQuestions || [
                'ما هي المسألة الرئيسية التي تناولها هذا المجلس؟',
                'اذكر ثلاثة من القواعد والفوائد المستنبطة من الدرس.',
                'ما أهمية كتاب القواعد المثلى في باب أسماء الله وصفاته؟'
              ]).map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ol>

            <button className="btn-modal-close" onClick={() => setShowQuizModal(false)}>
              إغلاق النافذة
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LectureDetail;
