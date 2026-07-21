import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { lectureCategories as categories } from '../utils/categories';
import SeriesCard from '../components/lectures/SeriesCard';
import Loader from '../components/ui/Loader';
import './ListPages.css';

const Lectures = () => {
  const location = useLocation();
  const [category, setCategory] = useState('الكل');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) {
      setCategory(cat);
    }
  }, [location.search]);

  const params = {
    limit: 50,
    ...(category !== 'الكل' && { category }),
    ...(search && { search }),
  };

  const { data, loading, error } = useFetch('/lectures', params, [category, search]);

  // Group lectures by Book/Series name cleanly
  const bookSeriesGroups = useMemo(() => {
    if (!data?.data?.length) return [];
    const groupsMap = {};

    data.data.forEach((lecture) => {
      const sName = lecture.series || lecture.title.split('—')[0].trim() || 'دروس عامة';
      if (!groupsMap[sName]) {
        groupsMap[sName] = {
          seriesName: sName,
          category: lecture.category,
          lessons: [],
          firstLectureId: lecture._id,
        };
      }
      groupsMap[sName].lessons.push(lecture);
    });

    return Object.values(groupsMap);
  }, [data]);

  return (
    <div className="list-page-wrapper">
      <div className="list-breadcrumb">
        <Link to="/">الرئيسية</Link>
        <span>/</span>
        <Link to="/lectures">الدروس والدورات</Link>
        <span>/</span>
        <span className="current">الكتب والدورات الشارحة</span>
      </div>

      <div className="list-layout">
        <aside className="list-sidebar">
          <div className="sidebar-title">{category === 'الكل' ? 'تصفح حسب العلم' : category}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              className={`sidebar-item ${category === 'الكل' ? 'active' : ''}`}
              onClick={() => setCategory('الكل')}
            >
              <span>الكل</span>
            </div>
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`sidebar-item ${category === cat.name ? 'active' : ''}`}
                onClick={() => setCategory(cat.name)}
              >
                <span>{cat.name}</span>
                <span className="sidebar-count">{cat.count}</span>
              </div>
            ))}
          </div>
        </aside>

        <div className="list-main">
          <div className="list-header">
            <h1 className="list-title">
              {category === 'الكل' ? 'جميع الكتب والدورات الشارحة' : `كتب ودورات: ${category}`}
            </h1>
            <span className="list-count">{bookSeriesGroups.length} كتب ومؤلفات</span>
          </div>
          
          <input
            type="search"
            placeholder="ابحث عن كتاب أو شرح معين..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="list-search"
          />

          {loading && <Loader />}
          {error && <div className="alert alert-error">{error}</div>}
          
          {!loading && !error && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
                {bookSeriesGroups.map((group, idx) => (
                  <SeriesCard
                    key={idx}
                    seriesName={group.seriesName}
                    category={group.category}
                    lessonsCount={group.lessons.length}
                    firstLectureId={group.firstLectureId}
                  />
                ))}
              </div>
              {!bookSeriesGroups.length && <p style={{ color: 'oklch(0.6 0.03 255)' }}>لا توجد كتب مطابقة في هذا التصنيف</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lectures;
