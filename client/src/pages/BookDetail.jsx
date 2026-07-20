import { useParams, Link } from 'react-router-dom';
import { FiDownload } from 'react-icons/fi';
import { useFetch } from '../hooks/useFetch';
import { getStorageUrl } from '../services/api';
import BookCard from '../components/books/BookCard';
import Loader from '../components/ui/Loader';
import './BookDetail.css';

const BookDetail = () => {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/books/${id}`);

  if (loading) return <Loader />;
  if (error) return <div className="container alert alert-error">{error}</div>;

  const { data: book, related } = data;

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="pill">{book.category}</span>
          <h1>{book.title}</h1>
          <p>{book.author}</p>
        </div>
      </div>

      <div className="container book-detail">
        <div className="book-detail-grid">
          <div className="book-detail-cover">
            {book.coverImage ? (
              <img src={getStorageUrl(book.coverImage)} alt={book.title} />
            ) : (
              <div className="book-placeholder-lg">📚</div>
            )}
          </div>
          <div className="book-detail-info">
            {book.description && <p>{book.description}</p>}
            {book.pages && <p className="book-meta">{book.pages} صفحة</p>}
            <div className="book-detail-actions">
              <a
                href={getStorageUrl(book.pdfUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                قراءة الكتاب
              </a>
              <a
                href={getStorageUrl(book.pdfUrl)}
                download
                className="btn btn-outline"
              >
                <FiDownload /> تحميل PDF
              </a>
            </div>
          </div>
        </div>

        <div className="pdf-viewer">
          <iframe
            src={getStorageUrl(book.pdfUrl)}
            title={book.title}
            loading="lazy"
          />
        </div>

        {related?.length > 0 && (
          <div className="related-section">
            <h2>كتب ذات صلة</h2>
            <div className="grid grid-3">
              {related.map((b) => <BookCard key={b._id} book={b} />)}
            </div>
          </div>
        )}

        <Link to="/books" className="btn btn-outline">← العودة للكتب</Link>
      </div>
    </>
  );
};

export default BookDetail;
