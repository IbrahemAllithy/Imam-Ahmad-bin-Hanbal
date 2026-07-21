import { logo, sheikh } from '../assets';
import './About.css';

const About = () => (
  <>
    <div className="page-header">
      <div className="container">
        <h1>عن الشيخ</h1>
        <p>الموقع الرسمي لفضيلة الشيخ شعبان العودة</p>
      </div>
    </div>

    <div className="container about-page">
      <div className="about-intro">
        <img src={sheikh} alt="شعار الموقع الرسمي للشيخ شعبان العودة" className="about-logo" style={{ borderRadius: '50%', objectFit: 'cover' }} />
        <p className="about-intro-text">
          هذا الموقع هو المنصة الرسمية التي تُعنى بنشر العلم الشرعي لفضيلة الشيخ شعبان العودة على منهج السلف الصالح.
        </p>
      </div>

      <section className="about-block">
        <h2>رسالة الموقع</h2>
        <p>
          يهدف الموقع إلى نشر العلم الشرعي
          على منهج السلف الصالح، وفق فهم الإمام أحمد بن حنبل ومنهج أهل السنة والجماعة.
        </p>
        <p>
          ويسعى إلى تقديم محتوى علمي موثوق من محاضرات ودروس ومقالات وكتب،
          تخدم طالب العلم والباحث والمهتم بعلوم الشريعة.
        </p>
      </section>

      <section className="about-block about-sheikh">
        <div className="about-sheikh-content">
          <h2>الشيخ شعبان العودة</h2>
          <p>
            الشيخ أبو عبيدة شعبان بن سليم بن سالم العودة المصري الحنبلي — حفظه الله — باحث شرعي مصري ومشتغل بمجالس السنة،
            يُشرف على هذا الموقع ويقدّم من خلاله دروساً ومحاضرات
            في العقيدة والفقه والتفسير وغيرها من العلوم الشرعية.
          </p>
        </div>
        <img
          src={sheikh}
          alt="الشيخ شعبان العودة — حفظه الله"
          className="about-sheikh-img"
        />
      </section>

      <section className="about-block about-values">
        <h2>محاور العمل</h2>
        <ul>
          <li>🎥 محاضرات ودروس مرئية على يوتيوب</li>
          <li>📝 مقالات علمية ودعوية</li>
          <li>📚 كتب ومؤلفات PDF للقراءة والتحميل</li>
          <li>🕌 التزام بمنهج أهل السنة والجماعة</li>
        </ul>
      </section>
    </div>
  </>
);

export default About;
