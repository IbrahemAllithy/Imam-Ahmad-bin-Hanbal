import { Link } from 'react-router-dom';
import { FiCompass, FiChevronLeft } from 'react-icons/fi';
import { useFetch } from '../hooks/useFetch';
import { useLectures } from '../hooks/useLectures';
import Loader from '../components/ui/Loader';
import './PlatformPages.css';

const StartHere = () => {
  const { data: seriesData, loading: seriesLoading } = useFetch('/lectures/series/list');
  const { data: lecturesData, loading: lecturesLoading } = useLectures();

  const loading = seriesLoading || lecturesLoading;

  let seriesList = seriesData?.data || [];

  if (!seriesList.length && lecturesData?.data?.length) {
    const counts = {};
    lecturesData.data.forEach((l) => {
      const name = l.series || l.category;
      if (name) counts[name] = (counts[name] || 0) + 1;
    });
    seriesList = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name]) => name);
  } else {
    seriesList = seriesList.slice(0, 4);
  }

  return (
    <div className="platform-page">
      <div className="container">
        <div className="platform-header">
          <h1>
            <FiCompass style={{ marginLeft: 10, verticalAlign: 'middle' }} />
            ابدأ من هنا
          </h1>
          <p>مسارات مقترحة للبدء في طلب العلم على الموقع</p>
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
          <p className="platform-empty">لا توجد دورات متاحة حالياً.</p>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/lectures" className="btn btn-outline">
            استعرض جميع الدروس
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StartHere;
