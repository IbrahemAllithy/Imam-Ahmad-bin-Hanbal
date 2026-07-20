import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import ArticleCard from '../components/articles/ArticleCard';
import CategoryFilter from '../components/ui/CategoryFilter';
import Loader from '../components/ui/Loader';
import './ListPages.css';

const Articles = () => {
  const [category, setCategory] = useState('الكل');
  const [search, setSearch] = useState('');

  const params = {
    limit: 12,
    ...(category !== 'الكل' && { category }),
    ...(search && { search }),
  };

  const { data, loading, error } = useFetch('/articles', params, [category, search]);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>المقالات</h1>
          <p>مقالات علمية ودعوية</p>
        </div>
      </div>

      <div className="container list-page">
        <div className="list-toolbar">
          <input
            type="search"
            placeholder="ابحث في المقالات..."
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
              {data?.data?.map((a) => <ArticleCard key={a._id} article={a} />)}
            </div>
            {!data?.data?.length && <p className="empty-state">لا توجد مقالات</p>}
          </>
        )}
      </div>
    </>
  );
};

export default Articles;
