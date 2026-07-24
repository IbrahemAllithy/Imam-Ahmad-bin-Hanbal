import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLectures } from '../hooks/useLectures';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { FiCheckCircle, FiChevronDown, FiSearch, FiYoutube } from 'react-icons/fi';
import Loader from '../components/ui/Loader';
import './ListPages.css';

const categoryFromSearch = (search) => {
  const cat = new URLSearchParams(search).get('category');
  return cat && cat.trim() ? cat.trim() : 'الكل';
};

const Lectures = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const categories = settings.categories || [];
  const [category, setCategory] = useState(() => categoryFromSearch(location.search));
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [completedMap, setCompletedMap] = useState({});

  useEffect(() => {
    setCategory(categoryFromSearch(location.search));
  }, [location.search]);

  // Load completion states
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

  const params = {
    ...(category !== 'الكل' && { category }),
    ...(debouncedSearch && { search: debouncedSearch }),
  };

  const { data, loading, error } = useLectures(params);

  // Group lectures into Course/Series Bars
  const coursesList = useMemo(() => {
    if (!data?.data?.length) return [];
    const map = {};

    data.data.forEach((lecture) => {
      const sName =
        (lecture.series && String(lecture.series).trim()) ||
        lecture.title.split('—')[0].trim() ||
        lecture.title.split('-')[0].trim() ||
        'دروس عامة';
      if (!map[sName]) {
        map[sName] = {
          seriesName: sName,
          category: lecture.category,
          lessons: [],
          firstLectureId: lecture._id,
        };
      }
      map[sName].lessons.push(lecture);
    });

    return Object.values(map)
      .map((course) => {
        const sorted = [...course.lessons].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0)
        );
        const firstLesson = sorted[0];
        return {
          ...course,
          firstLectureId: firstLesson?._id || course.firstLectureId,
          thumbnailId: firstLesson?.youtubeId || null,
          youtubeUrl: firstLesson?.youtubeUrl || null,
        };
      })
      .sort((a, b) => a.seriesName.localeCompare(b.seriesName, 'ar'));
  }, [data]);

  // Count total completed courses
  const completedCoursesCount = coursesList.filter((course) =>
    course.lessons.every((l) => completedMap[l._id])
  ).length;

  return (
    <div className="list-page-wrapper">
      <div className="list-breadcrumb">
        <Link to="/">الرئيسية</Link>
        <span>/</span>
        <Link to="/lectures">الدروس والدورات</Link>
        <span>/</span>
        <span className="current">الدورات والبرامج العلمية</span>
      </div>

      <div className="courses-page-container">
        {/* Top Stats Banner matching Image 1 */}
        <div className="courses-stats-header">
          <div className="stat-box">
            <span className="stat-value">{coursesList.length}</span>
            <span className="stat-name">الدورات</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{completedCoursesCount}</span>
            <span className="stat-name">مكتملة</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{completedCoursesCount}</span>
            <span className="stat-name">الشهادات</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{completedCoursesCount * 15}</span>
            <span className="stat-name">النقاط</span>
          </div>
        </div>

        {/* Action & Filter Bar */}
        <div className="courses-actions-row">
          <h2 className="courses-section-title">
            {category === 'الكل' ? 'الدورات والكتب المتاحة' : `دورات علم: ${category}`}
          </h2>

          <div className="courses-search-filter">
            <div className="courses-search-box">
              <FiSearch />
              <input
                type="search"
                placeholder="ابحث عن دورة أو كتاب..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={category}
              onChange={(e) => {
                const next = e.target.value;
                setCategory(next);
                if (next === 'الكل') {
                  navigate('/lectures');
                } else {
                  navigate(`/lectures?category=${encodeURIComponent(next)}`);
                }
              }}
              className="category-dropdown-select"
            >
              <option value="الكل">عرض الكل</option>
              {categories.map((c) => (
                <option key={c.id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && <Loader />}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Clean Horizontal Course Bars (Step 1 matching Image 1) */}
        {!loading && !error && (
          <div className="courses-bars-list">
            {coursesList.map((course, idx) => {
              const isCourseDone = course.lessons.every((l) => completedMap[l._id]);
              return (
                <Link
                  key={idx}
                  to={`/courses/${encodeURIComponent(course.seriesName)}`}
                  className={`course-item-bar ${isCourseDone ? 'completed' : ''}`}
                >
                  <div className="course-item-right">
                    {course.thumbnailId && (
                      <span className="course-item-thumb">
                        <img
                          src={`https://img.youtube.com/vi/${course.thumbnailId}/mqdefault.jpg`}
                          alt=""
                          loading="lazy"
                        />
                      </span>
                    )}
                    <div className={`course-check-circle ${isCourseDone ? 'done' : ''}`}>
                      <FiCheckCircle />
                    </div>
                    <span className="course-item-title">{course.seriesName}</span>
                  </div>

                  <div className="course-item-left">
                    {isCourseDone && <span className="badge-course-completed">مكتمل</span>}
                    <span className="course-lessons-tag">{course.lessons.length} دروس</span>
                    {course.youtubeUrl && (
                      <span
                        className="course-youtube-btn"
                        role="button"
                        title="فتح القائمة على يوتيوب"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(course.youtubeUrl, '_blank', 'noopener,noreferrer');
                        }}
                      >
                        <FiYoutube />
                      </span>
                    )}
                    <FiChevronDown className="course-arrow-icon" />
                  </div>
                </Link>
              );
            })}

            {!coursesList.length && (
              <p className="no-courses-found">لا توجد دورات علمية مضافة في هذا التصنيف حالياً.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lectures;
