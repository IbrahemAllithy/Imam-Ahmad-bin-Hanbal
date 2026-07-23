import { useFetch } from '../../hooks/useFetch';
import { formatDate } from '../../utils/helpers';
import Loader from '../../components/ui/Loader';
import {
  FiVideo,
  FiFileText,
  FiBook,
  FiMail,
  FiInbox,
  FiUsers,
  FiAward,
  FiCheckCircle,
  FiMessageCircle,
} from 'react-icons/fi';

const AdminOverview = ({ onNavigate }) => {
  const { data, loading, error } = useFetch('/admin/stats');

  if (loading) return <Loader text="جاري تحميل الإحصائيات..." />;
  if (error) return <div className="alert alert-error">{error}</div>;

  const { counts, recent, topSeries } = data.data;

  const stats = [
    { id: 'lectures', label: 'المحاضرات', value: counts.lectures, icon: FiVideo, color: '#2f7bd3' },
    { id: 'articles', label: 'المقالات', value: counts.articles, icon: FiFileText, color: '#1e4e8c' },
    { id: 'books', label: 'الكتب', value: counts.books, icon: FiBook, color: '#d4a94e' },
    { id: 'students', label: 'الطلاب', value: counts.students || 0, icon: FiUsers, color: '#6b4f2c' },
    {
      id: 'contacts',
      label: 'الرسائل',
      value: counts.contacts,
      icon: FiMail,
      color: '#0c2d57',
      badge: counts.unreadContacts,
    },
  ];

  const extraStats = [
    { label: 'إكمال الدروس', value: counts.completions, icon: FiCheckCircle },
    { label: 'الشهادات', value: counts.certificates, icon: FiAward },
    {
      label: 'أسئلة معلقة',
      value: counts.pendingQuestions,
      icon: FiMessageCircle,
      onClick: () => onNavigate('questions'),
    },
  ];

  return (
    <div className="admin-overview">
      <div className="admin-page-header">
        <div>
          <h2>نظرة عامة</h2>
          <p>ملخص سريع لمحتوى الموقع وآخر التحديثات</p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map(({ id, label, value, icon: Icon, color, badge }) => (
          <button
            key={id}
            type="button"
            className="stat-card"
            onClick={() => onNavigate(id)}
            style={{ '--stat-color': color }}
          >
            <div className="stat-icon"><Icon /></div>
            <div className="stat-info">
              <span className="stat-value">{value}</span>
              <span className="stat-label">{label}</span>
              {badge > 0 && id === 'contacts' && (
                <span className="stat-badge">{badge} جديدة</span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="stats-grid" style={{ marginTop: '1rem' }}>
        {extraStats.map(({ label, value, icon: Icon, onClick }) => (
          <button
            key={label}
            type="button"
            className="stat-card"
            onClick={onClick}
            style={{ '--stat-color': '#15803d', cursor: onClick ? 'pointer' : 'default' }}
          >
            <div className="stat-icon"><Icon /></div>
            <div className="stat-info">
              <span className="stat-value">{value ?? 0}</span>
              <span className="stat-label">{label}</span>
            </div>
          </button>
        ))}
      </div>

      {topSeries?.length > 0 && (
        <div className="recent-card" style={{ marginTop: '1.5rem' }}>
          <div className="recent-card-header">
            <h3>أكثر الدورات إكمالاً</h3>
          </div>
          <ul className="recent-list">
            {topSeries.map((s) => (
              <li key={s.series}>
                <strong>{s.series}</strong>
                <span>{s.completions} إكمال</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="recent-grid">
        <RecentList
          title="آخر المحاضرات"
          items={recent.lectures}
          empty="لا توجد محاضرات"
          render={(item) => (
            <>
              <strong>{item.title}</strong>
              <span>{item.category} · {formatDate(item.createdAt)}</span>
            </>
          )}
          onViewAll={() => onNavigate('lectures')}
        />
        <RecentList
          title="آخر المقالات"
          items={recent.articles}
          empty="لا توجد مقالات"
          render={(item) => (
            <>
              <strong>{item.title}</strong>
              <span>{item.category} · {formatDate(item.createdAt)}</span>
            </>
          )}
          onViewAll={() => onNavigate('articles')}
        />
        <RecentList
          title="آخر الكتب"
          items={recent.books}
          empty="لا توجد كتب"
          render={(item) => (
            <>
              <strong>{item.title}</strong>
              <span>{item.author} · {formatDate(item.createdAt)}</span>
            </>
          )}
          onViewAll={() => onNavigate('books')}
        />
        <RecentList
          title="آخر الرسائل"
          items={recent.contacts}
          empty="لا توجد رسائل"
          render={(item) => (
            <>
              <strong>{item.name}{!item.read && ' · جديدة'}</strong>
              <span>{item.subject || 'بدون موضوع'} · {formatDate(item.createdAt)}</span>
            </>
          )}
          onViewAll={() => onNavigate('contacts')}
          icon={<FiInbox />}
        />
      </div>
    </div>
  );
};

const RecentList = ({ title, items, empty, render, onViewAll, icon }) => (
  <div className="recent-card">
    <div className="recent-card-header">
      <h3>{icon} {title}</h3>
      <button type="button" className="link-btn" onClick={onViewAll}>عرض الكل</button>
    </div>
    {items?.length ? (
      <ul className="recent-list">
        {items.map((item) => (
          <li key={item._id}>{render(item)}</li>
        ))}
      </ul>
    ) : (
      <p className="recent-empty">{empty}</p>
    )}
  </div>
);

export default AdminOverview;
