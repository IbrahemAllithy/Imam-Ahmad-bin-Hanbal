import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiBell, FiAward, FiSun, FiMoon } from 'react-icons/fi';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Navbar.css';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, sheikhImage } = useSiteSettings();
  const { user, logout, isStudent, isAdmin } = useAuth();
  const links = settings.navbar?.links || [];
  const { siteName, siteSubtitle } = settings.branding || {};

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const hasRealSession =
    user &&
    (isStudent || isAdmin) &&
    sessionStorage.getItem('accessToken') &&
    !sessionStorage.getItem('accessToken').startsWith('local_');

  useEffect(() => {
    if (!hasRealSession) {
      setUnreadCount(0);
      return;
    }

    const fetchUnread = async () => {
      try {
        const { data } = await api.get('/notifications');
        setUnreadCount(data.unread || 0);
      } catch {
        setUnreadCount(0);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [hasRealSession, user?.id]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

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

  const themeBtn = (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'الوضع النهارية' : 'الوضع الليلي'}
    >
      {theme === 'dark' ? <FiSun /> : <FiMoon />}
    </button>
  );

  const authActions = user ? (
    <>
      {themeBtn}
      {(isStudent || isAdmin) && (
        <Link to="/certificates" className="btn-login desktop-only" onClick={() => setOpen(false)} title="شهاداتي">
          <FiAward style={{ verticalAlign: 'middle' }} />
        </Link>
      )}
      {isStudent && hasRealSession && (
        <Link
          to="/notifications"
          className="navbar-bell"
          onClick={() => setOpen(false)}
          title="التنبيهات"
        >
          <FiBell />
          {unreadCount > 0 && <span className="navbar-bell-badge">{unreadCount}</span>}
        </Link>
      )}
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
      {themeBtn}
      <Link to="/login" className="btn-login" onClick={() => setOpen(false)}>
        دخول
      </Link>
      <Link to="/register" className="btn-start" onClick={() => setOpen(false)}>
        سجّل حساباً
      </Link>
    </>
  );

  const extraLinks = [
    { to: '/start', label: 'ابدأ من هنا' },
    { to: '/search', label: 'بحث' },
  ];

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

        <nav id="main-nav-menu" className={`navbar-links ${open ? 'open' : ''}`}>
          <div className="nav-menu">
            {extraLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`nav-item ${isActiveLink(to) ? 'active' : ''}`}
              >
                {label}
              </Link>
            ))}
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

        <button
          className="navbar-toggle"
          onClick={() => setOpen(!open)}
          aria-label="القائمة"
          aria-expanded={open}
          aria-controls="main-nav-menu"
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
