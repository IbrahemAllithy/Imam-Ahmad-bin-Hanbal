import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getBookCoverUrl } from '../../services/api';
import './BookCard.css';

const BookCard = ({ book }) => {
  const accent = '#2563eb';
  const [imgFailed, setImgFailed] = useState(false);
  const coverUrl = getBookCoverUrl(book);

  return (
    <Link to={`/books/${book._id}`} className="book-card-item">
      <div className="book-card-cover">
        {coverUrl && !imgFailed ? (
          <img
            src={coverUrl}
            alt={book.title}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
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
