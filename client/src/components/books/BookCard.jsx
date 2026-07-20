import { Link } from 'react-router-dom';
import { getStorageUrl } from '../../services/api';
import './BookCard.css';

const BookCard = ({ book }) => {
  const accent = '#2563eb';
  return (
    <Link to={`/books/${book._id}`} className="book-card-item">
      <div className="book-card-cover">
        {book.coverImage ? (
          <img src={getStorageUrl(book.coverImage)} alt={book.title} loading="lazy" />
        ) : (
          <span>غلاف الكتاب</span>
        )}
      </div>
      <div className="book-card-cat" style={{ color: accent }}>{book.category}</div>
      <div className="book-card-title">{book.title}</div>
      <div className="book-card-author">{book.author} · {book.pages || 0} صفحة</div>
    </Link>
  );
};

export default BookCard;
