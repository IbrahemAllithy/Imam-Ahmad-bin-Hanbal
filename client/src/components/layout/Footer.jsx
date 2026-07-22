import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-grid">
      <div>
        <div className="footer-title">الموقع الرسمي للشيخ شعبان العودة</div>
        <p className="footer-desc">الموقع الرسمي للشيخ شعبان العودة، يقدّم دروسًا وكتبًا ومقالات شرعية مبوّبة.</p>
      </div>
      <div>
        <div className="footer-col-title">الأقسام</div>
        <div className="footer-links">
          <Link to={`/lectures?category=${encodeURIComponent('العقيدة')}`}>العقيدة</Link>
          <Link to={`/lectures?category=${encodeURIComponent('الفقه')}`}>الفقه</Link>
          <Link to={`/lectures?category=${encodeURIComponent('الحديث')}`}>الحديث</Link>
          <Link to={`/lectures?category=${encodeURIComponent('التفسير')}`}>التفسير</Link>
          <Link to={`/lectures?category=${encodeURIComponent('السيرة')}`}>السيرة</Link>
          <Link to={`/lectures?category=${encodeURIComponent('اللغة العربية')}`}>اللغة العربية</Link>
        </div>
      </div>
      <div>
        <div className="footer-col-title">روابط</div>
        <div className="footer-links">
          <Link to="/lectures">الدروس</Link>
          <Link to="/books">الكتب</Link>
          <Link to="/articles">المقالات</Link>
        </div>
      </div>
      <div>
        <div className="footer-col-title">تواصل معنا</div>
        <div className="footer-contact">
          <span>info@imam-ahmad.com</span>
          <span>تويتر / X</span>
          <span>تيليجرام</span>
        </div>
      </div>
    </div>
    <div className="footer-bottom">
      © {new Date().getFullYear()} الموقع الرسمي للشيخ شعبان العودة. جميع الحقوق محفوظة.
    </div>
  </footer>
);

export default Footer;
