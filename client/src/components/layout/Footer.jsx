import { Link } from 'react-router-dom';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import './Footer.css';

const Footer = () => {
  const { settings } = useSiteSettings();
  const footer = settings.footer || {};
  const categories = (settings.categories || []).slice(0, 6);

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-title">{footer.title}</div>
          <p className="footer-desc">{footer.description}</p>
        </div>
        <div>
          <div className="footer-col-title">الأقسام</div>
          <div className="footer-links">
            {categories.map((cat) => (
              <Link
                key={cat.id || cat.name}
                to={`/lectures?category=${encodeURIComponent(cat.name)}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="footer-col-title">روابط</div>
          <div className="footer-links">
            <Link to="/lectures">الدروس</Link>
            <Link to="/books">الكتب</Link>
            <Link to="/articles">المقالات</Link>
          </div>
        </div>
        <div>
          <div className="footer-col-title">تواصل معنا</div>
          <div className="footer-contact">
            {footer.email && (
              <a href={`mailto:${footer.email}`}>{footer.email}</a>
            )}
            {(footer.socialLinks || []).map((link) =>
              link.url ? (
                <a key={link.label} href={link.url} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              ) : (
                <span key={link.label}>{link.label}</span>
              )
            )}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} {footer.title}. {footer.copyrightSuffix}
      </div>
    </footer>
  );
};

export default Footer;
