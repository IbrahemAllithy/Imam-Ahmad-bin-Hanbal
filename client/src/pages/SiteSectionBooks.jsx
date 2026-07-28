import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { getSectionById } from '../utils/siteSections';
import BookCard from '../components/books/BookCard';
import SkeletonGrid from '../components/ui/Skeleton';
import './LectureCategories.css';

const SiteSectionBooks = ({ sectionId }) => {
  const section = getSectionById(sectionId);
  const { data, loading, error } = useFetch('/books', {
    limit: 100,
    category: section?.name,
  });

  if (!section) return null;
  const books = data?.data || [];

  return (
    <div className="categories-page">
      <div className="categories-hero">
        <div className="categories-hero-inner">
          <div className="list-breadcrumb" style={{ marginBottom: '15px' }}>
            <Link to="/">الرئيسية</Link>
            <span>/</span>
            <Link to={section.path}>{section.name}</Link>
            <span>/</span>
            <span className="current">الكتب</span>
          </div>
          <h1>كتب {section.name}</h1>
          <p>اضغط على أي كتاب لقراءته وتحميله</p>
        </div>
      </div>

      <div className="categories-content">
        {loading && <SkeletonGrid count={6} />}
        {error && <div className="alert alert-error">{error}</div>}
        {!loading && !error && (
          books.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
              {books.map((b) => (
                <BookCard key={b._id} book={b} />
              ))}
            </div>
          ) : (
            <p className="sunnah-empty">لا توجد كتب مضافة في هذا القسم حتى الآن.</p>
          )
        )}
      </div>
    </div>
  );
};

export default SiteSectionBooks;
