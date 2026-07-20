import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { logo } from '../../assets';
import './Navbar.css';

const links = [
  { to: '/', label: 'الرئيسية' },
  { to: '/lectures', label: 'المحاضرات' },
  { to: '/articles', label: 'المقالات' },
  { to: '/books', label: 'الكتب' },
  { to: '/about', label: 'عن المجمع' },
  { to: '/contact', label: 'تواصل معنا' },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="مجمع الإمام أحمد بن حنبل" className="brand-logo" />
          <span>
            <strong>مجمع الإمام أحمد بن حنبل</strong>
            <small>للشيخ شعبان العودة</small>
          </span>
        </Link>

        <button className="navbar-toggle" onClick={() => setOpen(!open)} aria-label="القائمة">
          {open ? <FiX /> : <FiMenu />}
        </button>

        <nav className={`navbar-links ${open ? 'open' : ''}`}>
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
