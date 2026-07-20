import { Link } from 'react-router-dom';
import { logo } from '../../assets';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="container footer-grid">
      <div>
        <img src={logo} alt="مجمع الإمام أحمد بن حنبل" className="footer-logo" />
        <h3>مجمع الإمام أحمد بن حنبل</h3>
        <p>موقع تعليمي أكاديمي إسلامي على منهج السلف الصالح، تابع للشيخ شعبان العودة — حفظه الله.</p>
      </div>
      <div>
        <h4>روابط سريعة</h4>
        <ul>
          <li><Link to="/lectures">المحاضرات</Link></li>
          <li><Link to="/articles">المقالات</Link></li>
          <li><Link to="/books">الكتب</Link></li>
          <li><Link to="/about">عن المجمع</Link></li>
        </ul>
      </div>
      <div>
        <h4>تواصل</h4>
        <p>للاستفسارات والمقترحات</p>
        <Link to="/contact" className="btn btn-outline footer-btn">راسلنا</Link>
      </div>
    </div>
    <div className="footer-bottom">
      <div className="container">
        <p>© {new Date().getFullYear()} مجمع الإمام أحمد بن حنبل — جميع الحقوق محفوظة</p>
      </div>
    </div>
  </footer>
);

export default Footer;
