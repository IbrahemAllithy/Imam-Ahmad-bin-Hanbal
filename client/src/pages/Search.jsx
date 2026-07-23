import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/ui/Loader';
import './PlatformPages.css';

const TABS = [
  { id: 'lectures', label: 'الدروس' },
  { id: 'articles', label: 'المقالات' },
  { id: 'books', label: 'الكتب' },
];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [activeTab, setActiveTab] = useState('lectures');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runSearch = async (rawQ) => {
    const q = (rawQ ?? query).trim();
    if (q.length < 2) {
      setError('أدخل حرفين على الأقل للبحث');
      return;
    }
    setError('');
    setLoading(true);
    setSearchParams({ q });
    try {
      const { data } = await api.get('/search', { params: { q } });
      setResults(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'تعذر إجراء البحث');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQ.trim().length >= 2) {
      runSearch(initialQ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    runSearch();
  };

  const tabItems = results?.[activeTab] || [];

  return (
    <div className="platform-page">
      <div className="container">
        <div className="platform-header">
          <h1>بحث في الموقع</h1>
          <p>ابحث في الدروس والمقالات والكتب</p>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="اكتب كلمة البحث..."
            dir="rtl"
          />
          <button type="submit" className="btn btn-primary">
            بحث
          </button>
        </form>

        {error && <div className="alert alert-error">{error}</div>}
        {loading && <Loader />}

        {results && !loading && (
          <>
            <div className="search-tabs">
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  className={`search-tab ${activeTab === id ? 'active' : ''}`}
                  onClick={() => setActiveTab(id)}
                >
                  {label} ({results[id]?.length || 0})
                </button>
              ))}
            </div>

            {tabItems.length ? (
              tabItems.map((item) => {
                if (activeTab === 'lectures') {
                  return (
                    <Link key={item._id} to={`/lectures/${item._id}`} className="search-result-item">
                      <strong>{item.title}</strong>
                      <span className="platform-card-meta">
                        {item.series || item.category}
                      </span>
                    </Link>
                  );
                }
                if (activeTab === 'articles') {
                  return (
                    <Link key={item._id} to={`/articles/${item._id}`} className="search-result-item">
                      <strong>{item.title}</strong>
                      <span className="platform-card-meta">{item.category}</span>
                    </Link>
                  );
                }
                return (
                  <Link key={item._id} to={`/books/${item._id}`} className="search-result-item">
                    <strong>{item.title}</strong>
                    <span className="platform-card-meta">{item.author} · {item.category}</span>
                  </Link>
                );
              })
            ) : (
              <p className="platform-empty">لا توجد نتائج في هذا القسم.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
