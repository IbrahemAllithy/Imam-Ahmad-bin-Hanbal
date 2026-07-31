import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiMessageCircle } from 'react-icons/fi';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { getStorageUrl } from '../services/api';
import api from '../services/api';
import Loader from '../components/ui/Loader';
import './BuyBooks.css';

const whatsappLink = (number) => {
  const digits = (number || '').replace(/[^\d]/g, '');
  return `https://wa.me/${digits}`;
};

const BuyBooks = () => {
  const { settings } = useSiteSettings();
  const whatsappNumber = settings.bookStore?.whatsappNumber || '';
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get('/sale-books', { signal: controller.signal })
      .then((res) => setBooks(res.data?.data || []))
      .catch((err) => {
        if (err?.code === 'ERR_CANCELED') return;
        setError('حدث خطأ أثناء جلب الكتب');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  return (
    <div className="categories-page buy-books-page">
      <div className="categories-hero">
        <div className="categories-hero-inner">
          <div className="list-breadcrumb" style={{ marginBottom: '15px' }}>
            <Link to="/">الرئيسية</Link>
            <span>/</span>
            <span className="current">شراء الكتب</span>
          </div>
          <h1>
            <FiShoppingBag style={{ verticalAlign: 'middle', marginLeft: 8 }} />
            شراء الكتب
          </h1>
          <p>تصفّح مؤلفات الشيخ المطبوعة، وتواصل معنا مباشرة عبر واتساب لطلب أي كتاب</p>
        </div>
      </div>

      <div className="categories-content">
        {loading && <Loader />}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && (
          <>
            <div className="buy-books-grid">
              {books.map((b) => (
                <div className="buy-book-card" key={b._id}>
                  <div className="buy-book-cover">
                    <img src={getStorageUrl(b.coverImage)} alt={b.title} loading="lazy" />
                  </div>
                  <h3 className="buy-book-title">{b.title}</h3>
                  <a
                    className="buy-book-btn"
                    href={whatsappLink(whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiMessageCircle /> اطلب عبر واتساب
                  </a>
                </div>
              ))}
            </div>

            {!books.length && <p className="platform-empty">لا توجد كتب مضافة بعد</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default BuyBooks;
