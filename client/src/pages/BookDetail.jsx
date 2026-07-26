import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { FiBookOpen, FiDownload, FiBook } from 'react-icons/fi';
import { useFetch } from '../hooks/useFetch';
import { getStorageUrl, getBookCoverUrl } from '../services/api';
import Loader from '../components/ui/Loader';
import './BookDetail.css';

const BookDetail = () => {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/books/${id}`);
  const [imgFailed, setImgFailed] = useState(false);

  if (loading) return <Loader />;
  if (error) return <div className="container alert alert-error">{error}</div>;

  const { data: book } = data || {};
  if (!book) return <div className="container alert alert-error">لم يتم العثور على الكتاب المطلوب</div>;

  const coverUrl = getBookCoverUrl(book);

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
            {coverUrl && !imgFailed ? (
              <img
                src={coverUrl}
                alt={book.title}
                className="book-cover-img"
                onError={() => setImgFailed(true)}
              />
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

        </div>
      </div>
    </div>
  );
};

export default BookDetail;
