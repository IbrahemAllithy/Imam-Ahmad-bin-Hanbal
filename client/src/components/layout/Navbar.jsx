import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FiMenu, FiX, FiUser } from 'react-icons/fi';
import { logo } from '../../assets';
import './Navbar.css';

const links = [
  { to: '/', label: 'الرئيسية' },
  { to: '/lectures', label: 'الدروس' },
  { to: '/books', label: 'الكتب' },
  { to: '/articles', label: 'المقالات' },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="شعار مجمع الإمام أحمد" className="brand-logo" />
          <div className="brand-text">
            <div className="brand-title">الموقع الرسمي للشيخ شعبان العودة</div>
            <div className="brand-subtitle">مجمع الإمام أحمد</div>
          </div>
        </Link>

        <button className="navbar-toggle" onClick={() => setOpen(!open)} aria-label="القائمة">
          {open ? <FiX /> : <FiMenu />}
        </button>

        <nav className={`navbar-links ${open ? 'open' : ''}`}>
          <div className="nav-menu">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              >
                {label}
              </NavLink>
            ))}
          </div>
          
          {/* Mobile view buttons */}
          {/* Removed login buttons per user request */}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
