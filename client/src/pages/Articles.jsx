import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import ArticleCard from '../components/articles/ArticleCard';
import Loader from '../components/ui/Loader';
import './ListPages.css';

const Articles = () => {
  const [search, setSearch] = useState('');

  const params = {
    limit: 15,
    ...(search && { search }),
  };

  const { data, loading, error } = useFetch('/articles', params, [search]);

  const articles = data?.data || [];
  const firstArticle = articles.length > 0 ? articles[0] : null;
  const restArticles = articles.length > 1 ? articles.slice(1) : [];

  return (
    <div className="list-page-wrapper">
      <div className="list-breadcrumb">
        <Link to="/">الرئيسية</Link>
        <span>/</span>
        <span className="current">المقالات</span>
      </div>

      <div className="list-layout-full">
        <h1 className="list-title" style={{ marginBottom: '28px' }}>المقالات</h1>
        
        <input
          type="search"
          placeholder="ابحث في المقالات..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="list-search"
        />

        {loading && <Loader />}
        {error && <div className="alert alert-error">{error}</div>}
        
        {!loading && !error && (
          <>
            {firstArticle && <ArticleCard article={firstArticle} featured={true} />}
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {restArticles.map((a) => <ArticleCard key={a._id} article={a} featured={false} />)}
            </div>
            
            {!articles.length && <p style={{ color: 'oklch(0.6 0.03 255)' }}>لا توجد مقالات مطابقة</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default Articles;
