import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useFetch } from '../hooks/useFetch';
import { getStorageUrl } from '../services/api';
import { formatDate } from '../utils/helpers';
import ArticleCard from '../components/articles/ArticleCard';
import Loader from '../components/ui/Loader';
import './ArticleDetail.css';

const ArticleDetail = () => {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/articles/${id}`);

  if (loading) return <Loader />;
  if (error) return <div className="container alert alert-error">{error}</div>;

  const { data: article, related } = data;
  const sanitizedContent = DOMPurify.sanitize(article.content);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="pill">{article.category}</span>
          <h1>{article.title}</h1>
          <time>{formatDate(article.createdAt)}</time>
        </div>
      </div>

      <article className="container article-detail">
        {article.coverImage && (
          <img
            src={getStorageUrl(article.coverImage)}
            alt={article.title}
            className="article-hero-img"
          />
        )}

        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        {related?.length > 0 && (
          <div className="related-section">
            <h2>مقالات ذات صلة</h2>
            <div className="grid grid-3">
              {related.map((a) => <ArticleCard key={a._id} article={a} />)}
            </div>
          </div>
        )}

        <Link to="/articles" className="btn btn-outline">← العودة للمقالات</Link>
      </article>
    </>
  );
};

export default ArticleDetail;
