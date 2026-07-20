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
  const accent = '#2563eb';

  return (
    <div className="book-page-wrapper">
      <div className="book-breadcrumb">
        <Link to="/">الرئيسية</Link>
        <span>/</span>
        <Link to="/books">الكتب</Link>
        <span>/</span>
        <span className="current">{book.title}</span>
      </div>

      <div className="book-layout">
        <div className="book-sidebar">
          <div className="book-cover-wrapper">
            {book.coverImage ? (
              <img src={getStorageUrl(book.coverImage)} alt={book.title} className="book-cover-img" />
            ) : (
              <span className="book-cover-placeholder">غلاف الكتاب</span>
            )}
          </div>
          <div className="book-info-card">
            <div className="info-label">المؤلف</div>
            <div className="info-value">{book.author}</div>
            
            <div className="info-label">القسم</div>
            <div className="info-value">{book.category}</div>
            
            {book.pages && (
              <>
                <div className="info-label">عدد الصفحات</div>
                <div className="info-value">{book.pages} صفحة</div>
              </>
            )}

            <a 
              href={getStorageUrl(book.pdfUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="book-btn-primary"
              style={{ background: accent }}
            >
              قراءة الكتاب
            </a>
            <a 
              href={getStorageUrl(book.pdfUrl)}
              download
              className="book-btn-outline"
            >
              تحميل PDF
            </a>
          </div>
        </div>

        <div className="book-main-content">
          <h1 className="book-title">{book.title}</h1>
          {book.description && (
            <p className="book-desc">{book.description}</p>
          )}

          <div className="book-pdf-viewer">
            <iframe
              src={getStorageUrl(book.pdfUrl)}
              title={book.title}
              loading="lazy"
            />
          </div>

          {related?.length > 0 && (
            <div className="related-books-section">
              <div className="section-title">كتب ذات صلة</div>
              <div className="grid grid-3">
                {related.map((b) => <BookCard key={b._id} book={b} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
