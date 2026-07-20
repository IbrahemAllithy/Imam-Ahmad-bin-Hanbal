import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-grid">
      <div>
        <div className="footer-title">الموقع الرسمي للشيخ شعبان العودة</div>
        <p className="footer-desc">تابع لمجمع الإمام أحمد، يقدّم دروسًا وكتبًا ومقالات شرعية مبوّبة.</p>
      </div>
      <div>
        <div className="footer-col-title">الأقسام</div>
        <div className="footer-links">
          <Link to="/lectures">العقيدة</Link>
          <Link to="/lectures">الفقه</Link>
          <Link to="/lectures">الحديث</Link>
          <Link to="/lectures">التفسير</Link>
          <Link to="/lectures">السيرة</Link>
          <Link to="/lectures">اللغة العربية</Link>
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
