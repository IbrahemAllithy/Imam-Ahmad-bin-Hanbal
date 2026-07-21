import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { sheikh } from '../../assets';
import './Navbar.css';

const links = [
  { to: '/', label: 'الرئيسية' },
  { to: '/#about', label: 'عن الشيخ' },
  { to: '/lectures', label: 'الدورات والبرامج' },
  { to: '/#explore', label: 'استكشف خيارات' },
  { to: '/contact', label: 'التواصل والتسجيل' },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src={sheikh} alt="شعار الموقع الرسمي للشيخ شعبان العودة" className="brand-logo" />
          <div className="brand-text">
            <div className="brand-title">الموقع الرسمي للشيخ شعبان العودة</div>
            <div className="brand-subtitle">العلم الشرعي وتعليم القرآن</div>
          </div>
        </Link>

        <nav className={`navbar-links ${open ? 'open' : ''}`}>
          <div className="nav-menu">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) => (isActive && to !== '/#about' && to !== '/#explore' ? 'nav-item active' : 'nav-item')}
              >
                {label}
              </NavLink>
            ))}
          </div>
          
          <div className="mobile-only">
            <Link to="/contact" className="btn-start" onClick={() => setOpen(false)}>
              سجّل الآن
            </Link>
          </div>
        </nav>

        <div className="navbar-actions desktop-only">
          <Link to="/contact" className="btn-start">
            سجّل الآن
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
