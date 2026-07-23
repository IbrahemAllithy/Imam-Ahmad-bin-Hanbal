import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import useProgress from '../hooks/useProgress';
import { useAuth } from '../context/AuthContext';
import { FiCheckCircle, FiHelpCircle, FiChevronRight, FiAward } from 'react-icons/fi';
import Loader from '../components/ui/Loader';
import './CourseDetail.css';

const sortLessons = (lessons) =>
  [...lessons].sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
  });

const CourseDetail = () => {
  const { seriesName } = useParams();
  const decodedSeries = decodeURIComponent(seriesName || '');
  const { isStudent, isAdmin } = useAuth();
  const { isCompleted, progressPercent, isLoggedIn } = useProgress();

  const { data, loading, error } = useFetch('/lectures', {
    series: decodedSeries,
    limit: 100,
  });

  const courseLessons = useMemo(() => {
    const raw = data?.data || [];
    const filtered = raw.filter((l) => {
      const sName = l.series || l.title.split('—')[0]?.trim();
      return sName === decodedSeries || l.category === decodedSeries;
    });
    return sortLessons(filtered.length ? filtered : raw);
  }, [data, decodedSeries]);

  const completedCount = courseLessons.filter((l) => isCompleted(l._id)).length;
  const percent = progressPercent(courseLessons);
  const showCertLink = percent === 100 && isLoggedIn && (isStudent || isAdmin);

  if (loading) return <Loader />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="course-detail-page">
      <div className="course-detail-top">
        <Link to="/lectures" className="back-link">
          <FiChevronRight /> الرجوع لقائمة الدورات
        </Link>
      </div>

      <div className="course-overview-card">
        <h1 className="course-overview-title">{decodedSeries}</h1>
        <p className="course-overview-desc">
          شرح علمي مبارك لفضيلة الشيخ أبو عبيدة شعبان العودة.
        </p>

        {!isLoggedIn && (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            سجّل دخولك لحفظ التقدم على حسابك
          </p>
        )}

        {showCertLink && (
          <div style={{ marginBottom: '1rem' }}>
            <Link to="/certificates" className="btn-course-ask" style={{ background: '#15803d' }}>
              <FiAward style={{ margin: '0 0 -2px 6px' }} />
              مبروك! احصل على شهادتك
            </Link>
          </div>
        )}

        <div className="course-ask-button-wrapper">
          <Link to="/contact" className="btn-course-ask">
            <FiHelpCircle style={{ margin: '0 0 -2px 6px' }} />
            اضغط هنا لكتابة سؤال حول الدورة
          </Link>
        </div>
      </div>

      <div className="course-content-section">
        <div className="course-section-header">
          <h2>محتوى الدورة</h2>
          <span className="course-progress-tag">
            {completedCount} من {courseLessons.length} دروس مكتملة ({percent}%)
          </span>
        </div>

        <div className="course-progress-bar-wrap" style={{ marginBottom: '1.5rem' }}>
          <div
            className="course-progress-bar"
            style={{
              height: 8,
              background: 'var(--primary-border)',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${percent}%`,
                height: '100%',
                background: 'var(--accent-color)',
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>

        <div className="course-lessons-list">
          {courseLessons.map((lesson) => {
            const isDone = isCompleted(lesson._id);
            return (
              <Link
                key={lesson._id}
                to={`/lectures/${lesson._id}`}
                className={`course-lesson-bar ${isDone ? 'completed' : ''}`}
              >
                <div className="lesson-bar-title">{lesson.title}</div>
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
