import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageSquare } from 'react-icons/fi';
import { getStorageUrl } from '../services/api';
import api from '../services/api';
import Loader from '../components/ui/Loader';
import './Testimonials.css';

const Testimonials = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get('/testimonials', { signal: controller.signal })
      .then((res) => setItems(res.data?.data || []))
      .catch((err) => {
        if (err?.code === 'ERR_CANCELED') return;
        setError('حدث خطأ أثناء جلب البيانات');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  return (
    <div className="categories-page testimonials-page">
      <div className="categories-hero">
        <div className="categories-hero-inner">
          <div className="list-breadcrumb" style={{ marginBottom: '15px' }}>
            <Link to="/">الرئيسية</Link>
            <span>/</span>
            <span className="current">قالوا عن الموقع</span>
          </div>
          <h1>
            <FiMessageSquare style={{ verticalAlign: 'middle', marginLeft: 8 }} />
            قالوا عن الموقع
          </h1>
        </div>
      </div>

      <div className="categories-content">
        {loading && <Loader />}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && (
          <div className="testimonials-grid">
            {items.map((t) => (
              <div className="testimonial-card" key={t._id}>
                {t.video && (
                  <video
                    src={getStorageUrl(t.video)}
                    controls
                    playsInline
                    className="testimonial-video"
                    preload="metadata"
                  />
                )}
                <div className="testimonial-author">
                  {t.photo && (
                    <img src={getStorageUrl(t.photo)} alt={t.name} className="testimonial-photo" />
                  )}
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    {t.title && <div className="testimonial-title">{t.title}</div>}
                  </div>
                </div>
                <p className="testimonial-quote">"{t.quote}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Testimonials;
