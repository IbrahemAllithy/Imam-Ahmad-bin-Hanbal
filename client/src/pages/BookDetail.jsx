import { useParams, Link } from 'react-router-dom';
import { FiBookOpen, FiDownload, FiBook } from 'react-icons/fi';
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

  const { data: book, related } = data || {};
  if (!book) return <div className="container alert alert-error">لم يتم العثور على الكتاب المطلوب</div>;

  return (
    <div className="book-page-wrapper">
      <div className="book-breadcrumb">
        <Link to="/">الرئيسية</Link>
        <span>/</span>
        <Link to="/books">المكتبة</Link>
        <span>/</span>
        <span className="current">{book.title}</span>
      </div>

      <div className="book-layout">
        <div className="book-sidebar">
          <div className="book-cover-wrapper">
            {book.coverImage ? (
              <img src={getStorageUrl(book.coverImage)} alt={book.title} className="book-cover-img" />
            ) : (
              <div className="book-cover-placeholder">
                <FiBook className="placeholder-icon" />
                <span>كتاب شرعي</span>
              </div>
            )}
          </div>

          <div className="book-info-card">
            <div className="info-item">
              <div className="info-label">المؤلف / الشارح</div>
              <div className="info-value">{book.author}</div>
            </div>
            
            <div className="info-item">
              <div className="info-label">التصنيف الشرعي</div>
              <div className="info-value">{book.category}</div>
            </div>
            
            {book.pages && (
              <div className="info-item">
                <div className="info-label">عدد الصفحات</div>
                <div className="info-value">{book.pages} صفحة</div>
              </div>
            )}

            <div className="book-actions-group">
              <a 
                href={getStorageUrl(book.pdfUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="book-btn-primary"
              >
                <FiBookOpen /> تصفح وقراءة الكتاب
              </a>
              <a 
                href={getStorageUrl(book.pdfUrl)}
                download
                className="book-btn-outline"
              >
                <FiDownload /> تحميل ملف PDF
              </a>
            </div>
          </div>
        </div>

        <div className="book-main-content">
          <div className="book-header-box">
            <span className="book-cat-tag">{book.category}</span>
            <h1 className="book-title">{book.title}</h1>
            {book.description && (
              <p className="book-desc">{book.description}</p>
            )}
          </div>

          <div className="book-pdf-viewer">
            <div className="viewer-bar">
              <span>قارئ الـ PDF المباشر</span>
              <a href={getStorageUrl(book.pdfUrl)} target="_blank" rel="noopener noreferrer">
                فتح بشاشة كاملة ↗
              </a>
            </div>
            <iframe
              src={getStorageUrl(book.pdfUrl)}
              title={book.title}
              loading="lazy"
            />
          </div>

          {related?.length > 0 && (
            <div className="related-books-section">
              <h3 className="section-title">كتب ومؤلفات ذات صلة</h3>
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
