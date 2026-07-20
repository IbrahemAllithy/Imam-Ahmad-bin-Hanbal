import { Link } from 'react-router-dom';
import { getStorageUrl } from '../../services/api';
import { formatDate, truncate } from '../../utils/helpers';
import './ArticleCard.css';

const ArticleCard = ({ article, featured = false }) => {
  const accent = '#2563eb';
  
  if (featured) {
    return (
      <Link to={`/articles/${article._id}`} className="article-card-featured">
        <div className="article-cover-featured">
          {article.coverImage ? (
            <img src={getStorageUrl(article.coverImage)} alt={article.title} loading="lazy" />
          ) : (
            <span>صورة المقال</span>
          )}
        </div>
        <div className="article-body-featured">
          <div className="article-cat" style={{ color: accent }}>{article.category}</div>
          <div className="article-title-featured">{article.title}</div>
          <p className="article-excerpt">{truncate(article.excerpt || article.content, 140)}</p>
          <div className="article-footer">
            {article.author} · {formatDate(article.createdAt)}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/articles/${article._id}`} className="article-card-item">
      <div className="article-cover-normal">
        {article.coverImage ? (
          <img src={getStorageUrl(article.coverImage)} alt={article.title} loading="lazy" />
        ) : (
          <span>صورة المقال</span>
        )}
      </div>
      <div className="article-body-normal">
        <div className="article-cat" style={{ color: accent }}>{article.category}</div>
        <div className="article-title">{article.title}</div>
        <div className="article-footer">
          {article.author} · {formatDate(article.createdAt)}
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
