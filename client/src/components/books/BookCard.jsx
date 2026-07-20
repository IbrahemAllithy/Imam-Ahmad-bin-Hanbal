import { Link } from 'react-router-dom';
import { FiDownload } from 'react-icons/fi';
import { getStorageUrl } from '../../services/api';
import './BookCard.css';

const BookCard = ({ book }) => (
  <div className="book-card">
    <div className="book-cover">
      {book.coverImage ? (
        <img src={getStorageUrl(book.coverImage)} alt={book.title} loading="lazy" />
      ) : (
        <div className="book-placeholder">📚</div>
      )}
    </div>
    <div className="book-body">
      <span className="pill">{book.category}</span>
      <h3>{book.title}</h3>
      <p className="book-author">{book.author}</p>
      {book.pages && <span className="book-pages">{book.pages} صفحة</span>}
      <div className="book-actions">
        <Link to={`/books/${book._id}`} className="btn btn-outline btn-sm">قراءة</Link>
        <a
          href={getStorageUrl(book.pdfUrl)}
          download
          className="btn btn-primary btn-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FiDownload /> تحميل
        </a>
      </div>
    </div>
  </div>
);

export default BookCard;
