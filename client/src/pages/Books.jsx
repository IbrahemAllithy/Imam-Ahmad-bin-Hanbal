import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import BookCard from '../components/books/BookCard';
import CategoryFilter from '../components/ui/CategoryFilter';
import Loader from '../components/ui/Loader';
import './ListPages.css';

const Books = () => {
  const [category, setCategory] = useState('الكل');
  const [search, setSearch] = useState('');

  const params = {
    limit: 12,
    ...(category !== 'الكل' && { category }),
    ...(search && { search }),
  };

  const { data, loading, error } = useFetch('/books', params, [category, search]);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>مكتبة الكتب</h1>
          <p>كتب PDF للقراءة والتحميل</p>
        </div>
      </div>

      <div className="container list-page">
        <div className="list-toolbar">
          <input
            type="search"
            placeholder="ابحث في الكتب..."
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
              {data?.data?.map((b) => <BookCard key={b._id} book={b} />)}
            </div>
            {!data?.data?.length && <p className="empty-state">لا توجد كتب</p>}
          </>
        )}
      </div>
    </>
  );
};

export default Books;
