import { useState, lazy, Suspense } from 'react';
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
  FiMessageCircle,
  FiSend,
  FiAward,
  FiShoppingBag,
  FiCalendar,
} from 'react-icons/fi';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import Loader from '../../components/ui/Loader';
import './Admin.css';

const AdminOverview = lazy(() => import('./AdminOverview'));
const AdminLectures = lazy(() => import('./AdminLectures'));
const AdminArticles = lazy(() => import('./AdminArticles'));
const AdminBooks = lazy(() => import('./AdminBooks'));
const AdminSaleBooks = lazy(() => import('./AdminSaleBooks'));
const AdminEvents = lazy(() => import('./AdminEvents'));
const AdminContacts = lazy(() => import('./AdminContacts'));
const AdminSettings = lazy(() => import('./AdminSettings'));
const AdminStudents = lazy(() => import('./AdminStudents'));
const AdminQuestions = lazy(() => import('./AdminQuestions'));
const AdminBroadcast = lazy(() => import('./AdminBroadcast'));
const AdminCertificates = lazy(() => import('./AdminCertificates'));

const NAV_ITEMS = [
  { id: 'overview', label: 'الرئيسية', icon: FiHome },
  { id: 'broadcast', label: 'الرسائل الجماعية', icon: FiSend },
  { id: 'lectures', label: 'المحاضرات', icon: FiVideo },
  { id: 'articles', label: 'المقالات', icon: FiFileText },
  { id: 'books', label: 'الكتب', icon: FiBook },
  { id: 'shop', label: 'متجر الكتب', icon: FiShoppingBag },
  { id: 'events', label: 'الفعاليات', icon: FiCalendar },
  { id: 'students', label: 'الطلاب', icon: FiUsers },
  { id: 'certificates', label: 'الشهادات', icon: FiAward },
  { id: 'questions', label: 'أسئلة الدروس', icon: FiMessageCircle },
  { id: 'contacts', label: 'رسائل الزوار', icon: FiMail },
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
        <Suspense fallback={<Loader />}>
          {tab === 'overview' && <AdminOverview onNavigate={setTab} />}
          {tab === 'broadcast' && <AdminBroadcast />}
          {tab === 'lectures' && <AdminLectures />}
          {tab === 'articles' && <AdminArticles />}
          {tab === 'books' && <AdminBooks />}
          {tab === 'shop' && <AdminSaleBooks />}
          {tab === 'events' && <AdminEvents />}
          {tab === 'students' && <AdminStudents />}
          {tab === 'certificates' && <AdminCertificates />}
          {tab === 'questions' && <AdminQuestions />}
          {tab === 'contacts' && <AdminContacts />}
          {tab === 'settings' && <AdminSettings />}
        </Suspense>
      </main>
    </div>
  );
};

export default AdminDashboard;
