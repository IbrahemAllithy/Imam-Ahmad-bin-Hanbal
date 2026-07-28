import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiX } from 'react-icons/fi';
import { getStorageUrl } from '../services/api';
import api from '../services/api';
import Loader from '../components/ui/Loader';
import './Events.css';

const formatDate = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get('/events', { signal: controller.signal })
      .then((res) => setEvents(res.data?.data || []))
      .catch((err) => {
        if (err?.code === 'ERR_CANCELED') return;
        setError('حدث خطأ أثناء جلب الفعاليات');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightbox]);

  return (
    <div className="categories-page events-page">
      <div className="categories-hero">
        <div className="categories-hero-inner">
          <div className="list-breadcrumb" style={{ marginBottom: '15px' }}>
            <Link to="/">الرئيسية</Link>
            <span>/</span>
            <span className="current">فعاليات</span>
          </div>
          <h1>
            <FiCalendar style={{ verticalAlign: 'middle', marginLeft: 8 }} />
            فعاليات
          </h1>
          <p>تابع فعاليات ومناسبات الشيخ شعبان العودة أولاً بأول</p>
        </div>
      </div>

      <div className="categories-content">
        {loading && <Loader />}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && (
          <>
            <div className="events-grid">
              {events.map((e) => (
                <div className="event-card" key={e._id}>
                  {e.coverImage && (
                    <button
                      type="button"
                      className="event-cover"
                      onClick={() => setLightbox({ src: getStorageUrl(e.coverImage), title: e.title })}
                      aria-label={`تكبير صورة: ${e.title}`}
                    >
                      <img src={getStorageUrl(e.coverImage)} alt={e.title} loading="lazy" />
                    </button>
                  )}
                  <div className="event-body">
                    {e.eventDate && (
                      <span className="event-date">
                        <FiCalendar /> {formatDate(e.eventDate)}
                      </span>
                    )}
                    <h3 className="event-title">{e.title}</h3>
                    {e.description && <p className="event-desc">{e.description}</p>}
                  </div>
                </div>
              ))}
            </div>

            {!events.length && <p className="platform-empty">لا توجد فعاليات مضافة بعد</p>}
          </>
        )}
      </div>

      {lightbox && (
        <div className="event-lightbox" onClick={() => setLightbox(null)}>
          <button
            type="button"
            className="event-lightbox-close"
            onClick={() => setLightbox(null)}
            aria-label="إغلاق"
          >
            <FiX />
          </button>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.src} alt={lightbox.title} />
            <figcaption>{lightbox.title}</figcaption>
          </figure>
        </div>
      )}
    </div>
  );
};

export default Events;
