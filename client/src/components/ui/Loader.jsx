import './Loader.css';

const Loader = ({ text = 'جاري التحميل...' }) => (
  <div className="loader-container">
    <div className="golden-spinner" />
    <span className="loader-text">{text}</span>
  </div>
);

export default Loader;
