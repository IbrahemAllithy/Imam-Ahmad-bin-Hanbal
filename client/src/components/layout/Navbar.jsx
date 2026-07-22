import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import './Navbar.css';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { settings, sheikhImage } = useSiteSettings();
  const links = settings.navbar?.links || [];
  const { siteName, siteSubtitle } = settings.branding || {};

  const isActiveLink = (to) => {
    if (to === '/') {
      return location.pathname === '/' && !location.hash;
    }
    if (to.startsWith('/#')) {
      return location.pathname === '/' && location.hash === to.replace('/', '');
    }
    return location.pathname.startsWith(to);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src={sheikhImage} alt={siteName} className="brand-logo" />
          <div className="brand-text">
            <div className="brand-title">{siteName}</div>
            <div className="brand-subtitle">{siteSubtitle}</div>
          </div>
        </Link>

        <nav className={`navbar-links ${open ? 'open' : ''}`}>
          <div className="nav-menu">
            {links.map(({ to, label }) => (
              <Link
                key={`${to}-${label}`}
                to={to}
                onClick={() => setOpen(false)}
                className={`nav-item ${isActiveLink(to) ? 'active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="mobile-only">
            <Link
              to={settings.navbar?.ctaLink || '/contact'}
              className="btn-start"
              onClick={() => setOpen(false)}
            >
              {settings.navbar?.ctaText || 'سجّل الآن'}
            </Link>
          </div>
        </nav>

        <div className="navbar-actions desktop-only">
          <Link to={settings.navbar?.ctaLink || '/contact'} className="btn-start">
            {settings.navbar?.ctaText || 'سجّل الآن'}
          </Link>
        </div>

        <button className="navbar-toggle" onClick={() => setOpen(!open)} aria-label="القائمة">
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
