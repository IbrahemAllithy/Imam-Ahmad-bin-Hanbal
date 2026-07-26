import { Link } from 'react-router-dom';
import { FiMonitor, FiUserPlus, FiBookOpen } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './PlatformPages.css';

const DistanceLearning = () => {
  const { user, isStudent } = useAuth();

  return (
    <div className="platform-page">
      <div className="container">
        <div className="platform-header">
          <h1>
            <FiMonitor style={{ marginLeft: 10, verticalAlign: 'middle' }} />
            التعلم عن بعد
          </h1>
          <p>برامج دراسية منظمة عن بعد بمتابعة ومراجعة مستمرة</p>
        </div>

        <div className="platform-card" style={{ textAlign: 'center' }}>
          {user && isStudent ? (
            <>
              <h3 style={{ marginBottom: '0.5rem' }}>أنت مسجّل بالفعل، أهلًا بك</h3>
              <p className="platform-card-meta">تصفّح الدروس والدورات المتاحة على الموقع الآن</p>
              <Link to="/lectures" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: '0.5rem' }}>
                <FiBookOpen /> تصفح الدروس
              </Link>
            </>
          ) : (
            <>
              <h3 style={{ marginBottom: '0.5rem' }}>للتسجيل في الدورات</h3>
              <p className="platform-card-meta">
                أنشئ حسابك في الموقع، وبعد التسجيل تفتح لك كل الدروس والدورات مباشرة
              </p>
              <Link to="/register" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: '0.5rem' }}>
                <FiUserPlus /> سجّل حسابك الآن
              </Link>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                لديك حساب بالفعل؟ <Link to="/login" style={{ fontWeight: 700, color: 'var(--accent-color)' }}>سجّل دخولك</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DistanceLearning;
