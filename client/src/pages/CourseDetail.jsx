import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { FiCheckCircle, FiHelpCircle, FiChevronRight } from 'react-icons/fi';
import Loader from '../components/ui/Loader';
import './CourseDetail.css';

const CourseDetail = () => {
  const { seriesName } = useParams();
  const decodedSeries = decodeURIComponent(seriesName || '');
  const { data, loading, error } = useFetch(`/lectures?limit=100`);

  const [completedMap, setCompletedMap] = useState({});

  useEffect(() => {
    const map = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('completed_lecture_')) {
        const id = key.replace('completed_lecture_', '');
        map[id] = localStorage.getItem(key) === 'true';
      }
    }
    setCompletedMap(map);
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="alert alert-error">{error}</div>;

  // Filter lessons belonging to this course/series
  const courseLessons = data?.data?.filter((l) => {
    const sName = l.series || l.title.split('—')[0].trim();
    return sName === decodedSeries || l.category === decodedSeries;
  }) || [];

  const completedCount = courseLessons.filter((l) => completedMap[l._id]).length;
  const progressPercent = courseLessons.length
    ? Math.round((completedCount / courseLessons.length) * 100)
    : 0;

  return (
    <div className="course-detail-page">
      {/* Back Link */}
      <div className="course-detail-top">
        <Link to="/lectures/list" className="back-link">
          <FiChevronRight /> الرجوع لقائمة الدورات
        </Link>
      </div>

      {/* Course Info Banner */}
      <div className="course-overview-card">
        <h1 className="course-overview-title">{decodedSeries}</h1>
        <p className="course-overview-desc">
          شرح علمي مبارك لفضيلة الشيخ أبو عبيدة شعبان العودة.
        </p>

        <div className="course-ask-button-wrapper">
          <Link to="/contact" className="btn-course-ask">
            <FiHelpCircle style={{ margin: '0 0 -2px 6px' }} />
            اضغط هنا لكتابة سؤال حول الدورة
          </Link>
        </div>
      </div>

      {/* Course Content Section (محتوى الدورة) */}
      <div className="course-content-section">
        <div className="course-section-header">
          <h2>محتوى الدورة</h2>
          <span className="course-progress-tag">
            {completedCount} من {courseLessons.length} دروس مكتملة ({progressPercent}%)
          </span>
        </div>

        <div className="course-lessons-list">
          {courseLessons.map((lesson, idx) => {
            const isDone = completedMap[lesson._id];
            return (
              <Link
                key={lesson._id}
                to={`/lectures/${lesson._id}`}
                className={`course-lesson-bar ${isDone ? 'completed' : ''}`}
              >
                <div className="lesson-bar-title">
                  {lesson.title}
                </div>
                <div className={`lesson-bar-icon ${isDone ? 'done' : ''}`}>
                  <FiCheckCircle />
                </div>
              </Link>
            );
          })}

          {!courseLessons.length && (
            <p className="no-lessons-text">لا توجد دروس مضافة لهذه الدورة حالياً.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
