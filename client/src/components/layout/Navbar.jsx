import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, sheikhImage } = useSiteSettings();
  const { user, logout, isStudent, isAdmin } = useAuth();
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

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate('/');
  };

  const authActions = user ? (
    <>
      {isStudent && (
        <Link to="/account" className="btn-login" onClick={() => setOpen(false)}>
          {user.name?.split(' ')[0] || 'حسابي'}
        </Link>
      )}
      {isAdmin && (
        <Link to="/admin" className="btn-login" onClick={() => setOpen(false)}>
          لوحة التحكم
        </Link>
      )}
      <button type="button" className="btn-start" onClick={handleLogout}>
        خروج
      </button>
    </>
  ) : (
    <>
      <Link to="/login" className="btn-login" onClick={() => setOpen(false)}>
        دخول
      </Link>
      <Link to="/register" className="btn-start" onClick={() => setOpen(false)}>
        سجّل حساباً
      </Link>
    </>
  );

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

          <div className="mobile-only navbar-auth-mobile">{authActions}</div>
        </nav>

        <div className="navbar-actions desktop-only">{authActions}</div>

        <button className="navbar-toggle" onClick={() => setOpen(!open)} aria-label="القائمة">
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
