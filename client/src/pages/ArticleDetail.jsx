import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useFetch } from '../hooks/useFetch';
import { getStorageUrl } from '../services/api';
import { formatDate } from '../utils/helpers';
import Loader from '../components/ui/Loader';
import './ArticleDetail.css';

const ArticleDetail = () => {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/articles/${id}`);

  if (loading) return <Loader />;
  if (error) return <div className="alert alert-error">{error}</div>;

  const { data: article, related } = data;
  const sanitizedContent = DOMPurify.sanitize(article.content);
  const accent = '#2563eb';
  const authorInitial = article.author ? article.author.charAt(0) : 'ش';
  const authorName = article.author || 'الشيخ شعبان العودة';

  return (
    <div className="article-page-wrapper">
      <div className="article-breadcrumb">
        <Link to="/">الرئيسية</Link>
        <span>/</span>
        <Link to="/articles">المقالات</Link>
        <span>/</span>
        <span className="current">{article.title}</span>
      </div>

      <div className="article-detail-layout">
        <div className="article-hero-thumb">
          {article.coverImage ? (
            <img
              src={getStorageUrl(article.coverImage)}
              alt={article.title}
              className="article-hero-img"
            />
          ) : (
            <span>صورة المقال الرئيسية</span>
          )}
        </div>
        
        <div className="article-columns">
          <div className="article-main">
            <div className="article-cat" style={{ color: accent }}>{article.category}</div>
            <h1 className="article-title">{article.title}</h1>
            <div className="article-meta">
              <div className="author-avatar" style={{ background: accent }}>{authorInitial}</div>
              <span>{authorName}</span>
              <span>·</span>
              <span>{formatDate(article.createdAt)}</span>
            </div>
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </div>
          
          <aside className="article-sidebar">
            <div className="author-card">
              <div className="author-avatar-lg" style={{ background: accent }}>{authorInitial}</div>
              <div className="author-name">{authorName}</div>
              <div className="author-desc">الموقع الرسمي للشيخ شعبان العودة.</div>
            </div>
            
            {related?.length > 0 && (
              <div className="related-articles">
                <div className="related-title">مقالات ذات صلة</div>
                <div className="related-list">
                  {related.map((ra) => (
                    <Link key={ra._id} to={`/articles/${ra._id}`} className="related-link">
                      {ra.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
