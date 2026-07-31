import { FiMonitor, FiClock } from 'react-icons/fi';
import './PlatformPages.css';

const DistanceLearning = () => {
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

        <div className="coming-soon-card">
          <div className="coming-soon-badge">
            <span className="coming-soon-pulse" />
            <FiClock />
          </div>
          <h3>ترقبوا فتح هذا القسم</h3>
        </div>
      </div>
    </div>
  );
};

export default DistanceLearning;
