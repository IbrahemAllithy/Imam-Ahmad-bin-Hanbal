import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageSquare } from 'react-icons/fi';
import { getStorageUrl } from '../services/api';
import api from '../services/api';
import Loader from '../components/ui/Loader';
// The page is built on the shared .categories-* shell, which lives here. Without this import
// the layout only appeared when some other page had already pulled the file in, so landing
// directly on /testimonials gave an unstyled, full-bleed page.
import './LectureCategories.css';
import './Testimonials.css';

const Video = ({ t }) => (
  <video
    src={getStorageUrl(t.video)}
    controls
    playsInline
    className="testimonial-video"
    preload="metadata"
  />
);

const Author = ({ t }) => (
  <div className="testimonial-author">
    {t.photo && <img src={getStorageUrl(t.photo)} alt={t.name} className="testimonial-photo" />}
    <div>
      <div className="testimonial-name">{t.name}</div>
      {t.title && <div className="testimonial-title">{t.title}</div>}
    </div>
  </div>
);

/**
 * The entry the admin dragged to the top gets the full width of the page rather than a
 * card-sized slot, so the section opens on something substantial instead of a lone card
 * stranded mid-page.
 */
const FeaturedTestimonial = ({ t }) => (
  <div className={`testimonial-featured ${t.video ? 'has-video' : 'text-only'}`}>
    {t.video && (
      <div className="testimonial-featured-media">
        <Video t={t} />
      </div>
    )}
    <div className="testimonial-featured-body">
      <p className="testimonial-featured-quote">{t.quote}</p>
      <Author t={t} />
    </div>
  </div>
);

const TestimonialCard = ({ t }) => (
  <div className={`testimonial-card ${t.video ? 'has-video' : 'text-only'}`}>
    {t.video && <Video t={t} />}
    <Author t={t} />
    <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
  </div>
);

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

  const [featured, ...rest] = items;

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
          <p>كلمات وتزكيات من أهل العلم وطلبته عن الموقع ومشاريعه.</p>
        </div>
      </div>

      <div className="categories-content">
        {loading && <Loader />}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && (
          <>
            {featured && <FeaturedTestimonial t={featured} />}

            {rest.length > 0 && (
              <div className="testimonials-grid">
                {rest.map((t) => (
                  <TestimonialCard key={t._id} t={t} />
                ))}
              </div>
            )}

            {!items.length && (
              <p className="testimonials-empty">لا توجد شهادات منشورة حتى الآن.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Testimonials;
