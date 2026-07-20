import { Link } from 'react-router-dom';
import { getStorageUrl } from '../../services/api';
import { formatDate, truncate } from '../../utils/helpers';
import './ArticleCard.css';

const ArticleCard = ({ article }) => (
  <Link to={`/articles/${article._id}`} className="article-card">
    {article.coverImage && (
      <div className="article-cover">
        <img src={getStorageUrl(article.coverImage)} alt={article.title} loading="lazy" />
      </div>
    )}
    <div className="article-body">
      <span className="pill">{article.category}</span>
      <h3>{article.title}</h3>
      <p>{truncate(article.excerpt || article.content, 140)}</p>
      <time>{formatDate(article.createdAt)}</time>
    </div>
  </Link>
);

export default ArticleCard;
