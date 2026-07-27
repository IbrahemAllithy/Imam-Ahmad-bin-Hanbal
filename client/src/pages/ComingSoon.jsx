import { Link } from 'react-router-dom';
import { FiClock } from 'react-icons/fi';
import './PlatformPages.css';

const ComingSoon = ({ title, icon }) => (
  <div className="platform-page">
    <div className="container">
      <div className="platform-header">
        <h1>
          {icon && <span style={{ marginLeft: 10, verticalAlign: 'middle' }}>{icon}</span>}
          {title}
        </h1>
        <p>
          <FiClock style={{ verticalAlign: 'middle', marginLeft: 6 }} />
          ترقبوا — هذا القسم قيد الإعداد وسيتم إطلاقه قريبًا بإذن الله
        </p>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to="/" className="btn btn-outline">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  </div>
);

export default ComingSoon;
