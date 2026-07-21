import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import LectureCard from '../components/lectures/LectureCard';
import Loader from '../components/ui/Loader';
import './ListPages.css';

const categories = [
  { id: 'aqeedah', name: 'العقيدة', count: 42 },
  { id: 'fiqh', name: 'الفقه', count: 65 },
  { id: 'hadith', name: 'الحديث', count: 38 },
  { id: 'tafsir', name: 'التفسير', count: 29 },
  { id: 'seerah', name: 'السيرة', count: 21 },
  { id: 'lugha', name: 'اللغة العربية', count: 17 },
];

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
    limit: 12,
    ...(category !== 'الكل' && { category }),
    ...(search && { search }),
  };

  const { data, loading, error } = useFetch('/lectures', params, [category, search]);

  return (
    <div className="list-page-wrapper">
      <div className="list-breadcrumb">
        <Link to="/">الرئيسية</Link>
        <span>/</span>
        <Link to="/lectures">الدروس والدورات</Link>
        <span>/</span>
        <span className="current">قائمة الدروس</span>
      </div>

      <div className="list-layout">
        <aside className="list-sidebar">
          <div className="sidebar-title">{category === 'الكل' ? 'تصفح حسب التصنيف' : category}</div>
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
            <h1 className="list-title">{category === 'الكل' ? 'جميع الدروس' : category}</h1>
            <span className="list-count">{data?.data?.length || 0} دروس</span>
          </div>
          
          <input
            type="search"
            placeholder="ابحث في الدروس..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="list-search"
          />

          {loading && <Loader />}
          {error && <div className="alert alert-error">{error}</div>}
          
          {!loading && !error && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
                {data?.data?.map((l) => <LectureCard key={l._id} lecture={l} />)}
              </div>
              {!data?.data?.length && <p style={{ color: 'oklch(0.6 0.03 255)' }}>لا توجد دروس مطابقة</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lectures;
