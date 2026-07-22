import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import BookCard from '../components/books/BookCard';
import Loader from '../components/ui/Loader';
import './ListPages.css';

const categories = [
  { name: 'العقيدة' }, { name: 'الفقه' }, { name: 'أصول فقه' }, { name: 'الحديث' },
  { name: 'التفسير' }, { name: 'السيرة' }, { name: 'آداب طالب العلم' },
];

const Books = () => {
  const [category, setCategory] = useState('الكل');
  const [search, setSearch] = useState('');

  const params = {
    limit: 50,
    ...(category !== 'الكل' && { category }),
    ...(search && { search }),
  };

  const { data, loading, error } = useFetch('/books', params, [category, search]);

  return (
    <div className="list-page-wrapper">
      <div className="list-breadcrumb">
        <Link to="/">الرئيسية</Link>
        <span>/</span>
        <span className="current">المكتبة</span>
      </div>

      <div className="list-layout-full">
        <h1 className="list-title" style={{ marginBottom: '20px' }}>المكتبة</h1>
        
        <input
          type="search"
          placeholder="ابحث في الكتب والمؤلفات..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="list-search"
        />

        <div className="pills-filter">
          <span 
            className={`pill-btn ${category === 'الكل' ? 'active' : ''}`}
            onClick={() => setCategory('الكل')}
          >
            الكل
          </span>
          {categories.map((cat, idx) => (
            <span
              key={idx}
              className={`pill-btn ${category === cat.name ? 'active' : ''}`}
              onClick={() => setCategory(cat.name)}
            >
              {cat.name}
            </span>
          ))}
        </div>

        {loading && <Loader />}
        {error && <div className="alert alert-error">{error}</div>}
        
        {!loading && !error && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
              {data?.data?.map((b) => <BookCard key={b._id} book={b} />)}
            </div>
            {!data?.data?.length && <p style={{ color: 'oklch(0.6 0.03 255)', textAlign: 'center', padding: '40px 0' }}>لا توجد كتب مطابقة في المكتبة</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default Books;
