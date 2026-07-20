import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import VideoPlayer from '../components/lectures/VideoPlayer';
import LectureCard from '../components/lectures/LectureCard';
import Loader from '../components/ui/Loader';

const LectureDetail = () => {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/lectures/${id}`);

  if (loading) return <Loader />;
  if (error) return <div className="container alert alert-error">{error}</div>;

  const { data: lecture, related } = data;

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="pill">{lecture.category}</span>
          <h1>{lecture.title}</h1>
          {lecture.series && <p>{lecture.series}</p>}
        </div>
      </div>

      <div className="container detail-page">
        <VideoPlayer youtubeId={lecture.youtubeId} title={lecture.title} />

        {lecture.description && (
          <div className="detail-content">
            <h2>الوصف</h2>
            <p>{lecture.description}</p>
          </div>
        )}

        {related?.length > 0 && (
          <div className="related-section">
            <h2>محاضرات ذات صلة</h2>
            <div className="grid grid-3">
              {related.map((l) => <LectureCard key={l._id} lecture={l} />)}
            </div>
          </div>
        )}

        <Link to="/lectures" className="btn btn-outline">← العودة للمحاضرات</Link>
      </div>
    </>
  );
};

export default LectureDetail;
