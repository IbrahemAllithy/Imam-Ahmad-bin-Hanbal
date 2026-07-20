import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import LectureCard from '../components/lectures/LectureCard';
import CategoryFilter from '../components/ui/CategoryFilter';
import Loader from '../components/ui/Loader';
import './ListPages.css';

const Lectures = () => {
  const [category, setCategory] = useState('الكل');
  const [search, setSearch] = useState('');

  const params = {
    limit: 12,
    ...(category !== 'الكل' && { category }),
    ...(search && { search }),
  };

  const { data, loading, error } = useFetch('/lectures', params, [category, search]);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>المحاضرات</h1>
          <p>دروس ومحاضرات علمية مضمّنة من يوتيوب</p>
        </div>
      </div>

      <div className="container list-page">
        <div className="list-toolbar">
          <input
            type="search"
            placeholder="ابحث في المحاضرات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <CategoryFilter active={category} onChange={setCategory} />

        {loading && <Loader />}
        {error && <div className="alert alert-error">{error}</div>}
        {!loading && !error && (
          <>
            <div className="grid grid-3">
              {data?.data?.map((l) => <LectureCard key={l._id} lecture={l} />)}
            </div>
            {!data?.data?.length && <p className="empty-state">لا توجد محاضرات</p>}
          </>
        )}
      </div>
    </>
  );
};

export default Lectures;
