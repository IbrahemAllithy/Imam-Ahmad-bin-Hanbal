import { Link } from 'react-router-dom';
import { FiBookOpen } from 'react-icons/fi';
import './PlatformPages.css';

const SunnahReading = () => (
  <div className="platform-page">
    <div className="container">
      <div className="platform-header">
        <h1>
          <FiBookOpen style={{ marginLeft: 10, verticalAlign: 'middle' }} />
          قراءة السنة
        </h1>
        <p>انتظرونا قريبًا بإذن الله</p>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to="/" className="btn btn-outline">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  </div>
);

export default SunnahReading;
