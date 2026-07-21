import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { lectureCategories as categories } from '../utils/categories';
import { FiCheckCircle, FiX, FiPlay } from 'react-icons/fi';
import VideoPlayer from '../components/lectures/VideoPlayer';
import LectureCard from '../components/lectures/LectureCard';
import Loader from '../components/ui/Loader';
import './ListPages.css';

const Lectures = () => {
  const location = useLocation();
  const [category, setCategory] = useState('الكل');
  const [search, setSearch] = useState('');
  const [activeModalLecture, setActiveModalLecture] = useState(null);
  const [completedMap, setCompletedMap] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) {
      setCategory(cat);
    }
  }, [location.search]);

  // Load completion states from localStorage
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
  }, [activeModalLecture]);

  const toggleModalCompleted = (id) => {
    const nextState = !completedMap[id];
    localStorage.setItem(`completed_lecture_${id}`, String(nextState));
    setCompletedMap((prev) => ({ ...prev, [id]: nextState }));
  };

  const params = {
    limit: 12,
    ...(category !== 'الكل' && { category }),
    ...(search && { search }),
  };

  const { data, loading, error } = useFetch('/lectures', params, [category, search]);

  let activeYoutubeId = activeModalLecture?.youtubeId;
  if (!activeYoutubeId && activeModalLecture?.youtubeUrl) {
    try {
      activeYoutubeId = new URL(activeModalLecture.youtubeUrl).searchParams.get('v');
    } catch (e) {
      // ignore
    }
  }

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
                {data?.data?.map((l) => (
                  <div key={l._id} style={{ position: 'relative' }}>
                    <LectureCard 
                      lecture={l} 
                      isCompleted={completedMap[l._id]}
                      onOpenModal={() => setActiveModalLecture(l)} 
                    />
                  </div>
                ))}
              </div>
              {!data?.data?.length && <p style={{ color: 'oklch(0.6 0.03 255)' }}>لا توجد دروس مطابقة</p>}
            </>
          )}
        </div>
      </div>

      {/* Modal for Watching Video & Marking Completed */}
      {activeModalLecture && (
        <div className="lecture-modal-overlay" onClick={() => setActiveModalLecture(null)}>
          <div className="lecture-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="lecture-modal-header">
              <h3>{activeModalLecture.title}</h3>
              <button className="modal-close-btn" onClick={() => setActiveModalLecture(null)}>
                <FiX />
              </button>
            </div>
            
            <div className="lecture-modal-body">
              <VideoPlayer youtubeId={activeYoutubeId} title={activeModalLecture.title} />
              
              <div className="lecture-modal-actions">
                <button 
                  className={`btn-completed ${completedMap[activeModalLecture._id] ? 'completed' : ''}`}
                  onClick={() => toggleModalCompleted(activeModalLecture._id)}
                >
                  <FiCheckCircle style={{ fontSize: '1.2rem' }} />
                  {completedMap[activeModalLecture._id] ? 'تم إكمال الدرس ✓' : 'أكملت الدرس'}
                </button>

                <Link 
                  to={`/lectures/${activeModalLecture._id}`} 
                  className="btn-modal-fullpage"
                  onClick={() => setActiveModalLecture(null)}
                >
                  فتح صفحة الدرس كاملة ↗
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lectures;
