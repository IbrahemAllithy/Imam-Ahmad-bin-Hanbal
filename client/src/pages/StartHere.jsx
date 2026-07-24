import { Link } from 'react-router-dom';
import { FiCompass, FiChevronLeft } from 'react-icons/fi';
import { useFetch } from '../hooks/useFetch';
import { useLectures } from '../hooks/useLectures';
import { useSiteSettings } from '../context/SiteSettingsContext';
import Loader from '../components/ui/Loader';
import './PlatformPages.css';

const StartHere = () => {
  const { settings } = useSiteSettings();
  const page = settings.startHerePage || {};
  const { data: seriesData, loading: seriesLoading } = useFetch('/lectures/series/list');
  const seriesFromApi = seriesData?.data || [];
  // Only fall back to fetching every lecture (expensive) if the lightweight
  // series list truly came back empty.
  const needsFallback = !seriesLoading && seriesFromApi.length === 0;
  const { data: lecturesData, loading: lecturesLoading } = useLectures({}, needsFallback);

  const loading = seriesLoading || (needsFallback && lecturesLoading);

  let seriesList = seriesFromApi.slice(0, 4);

  if (needsFallback && lecturesData?.data?.length) {
    const counts = {};
    lecturesData.data.forEach((l) => {
      const name = l.series || l.category;
      if (name) counts[name] = (counts[name] || 0) + 1;
    });
    seriesList = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name]) => name);
  }

  return (
    <div className="platform-page">
      <div className="container">
        <div className="platform-header">
          <h1>
            <FiCompass style={{ marginLeft: 10, verticalAlign: 'middle' }} />
            {page.headerTitle}
          </h1>
          <p>{page.headerSubtitle}</p>
        </div>

        {loading ? (
          <Loader />
        ) : seriesList.length ? (
          <div className="start-series-grid">
            {seriesList.map((name, idx) => (
              <Link
                key={name}
                to={`/courses/${encodeURIComponent(name)}`}
                className="start-series-card"
              >
                <span style={{ color: 'var(--accent-color)', fontWeight: 700, fontSize: '0.85rem' }}>
                  المسار {idx + 1}
                </span>
                <h3>{name}</h3>
                <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>
                  ابدأ الدورة <FiChevronLeft style={{ verticalAlign: 'middle' }} />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="platform-empty">{page.emptyText}</p>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/lectures" className="btn btn-outline">
            {page.allLecturesLinkText}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StartHere;
