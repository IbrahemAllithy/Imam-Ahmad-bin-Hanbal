import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome,
  FiVideo,
  FiFileText,
  FiBook,
  FiMail,
  FiExternalLink,
  FiLogOut,
  FiSettings,
  FiUsers,
} from 'react-icons/fi';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import AdminOverview from './AdminOverview';
import AdminLectures from './AdminLectures';
import AdminArticles from './AdminArticles';
import AdminBooks from './AdminBooks';
import AdminContacts from './AdminContacts';
import AdminSettings from './AdminSettings';
import AdminStudents from './AdminStudents';
import './Admin.css';

const NAV_ITEMS = [
  { id: 'overview', label: 'الرئيسية', icon: FiHome },
  { id: 'lectures', label: 'المحاضرات', icon: FiVideo },
  { id: 'articles', label: 'المقالات', icon: FiFileText },
  { id: 'books', label: 'الكتب', icon: FiBook },
  { id: 'students', label: 'الطلاب', icon: FiUsers },
  { id: 'contacts', label: 'الرسائل', icon: FiMail },
  { id: 'settings', label: 'إعدادات الموقع', icon: FiSettings },
];

const AdminDashboard = () => {
  const [tab, setTab] = useState('overview');
  const { user, logout } = useAuth();
  const { logoImage, settings } = useSiteSettings();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src={logoImage} alt={settings.branding.siteName} className="admin-brand-logo" />
          <div>
            <h2>لوحة التحكم</h2>
            <p className="admin-user">{user?.name}</p>
          </div>
        </div>

        <nav>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={tab === id ? 'active' : ''}
              onClick={() => setTab(id)}
            >
              <Icon /> {label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" target="_blank" className="admin-site-link">
            <FiExternalLink /> عرض الموقع
          </Link>
          <button type="button" className="admin-logout" onClick={handleLogout}>
            <FiLogOut /> تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {tab === 'overview' && <AdminOverview onNavigate={setTab} />}
        {tab === 'lectures' && <AdminLectures />}
        {tab === 'articles' && <AdminArticles />}
        {tab === 'books' && <AdminBooks />}
        {tab === 'students' && <AdminStudents />}
        {tab === 'contacts' && <AdminContacts />}
        {tab === 'settings' && <AdminSettings />}
      </main>
    </div>
  );
};

export default AdminDashboard;
