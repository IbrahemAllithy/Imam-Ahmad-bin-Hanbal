import { logo, sheikh } from '../assets';
import './About.css';

const About = () => (
  <>
    <div className="page-header">
      <div className="container">
        <h1>عن المجمع</h1>
        <p>مجمع الإمام أحمد بن حنبل — تابع للشيخ شعبان العودة</p>
      </div>
    </div>

    <div className="container about-page">
      <div className="about-intro">
        <img src={logo} alt="شعار مجمع الإمام أحمد بن حنبل" className="about-logo" />
        <p className="about-intro-text">
          مجمع الإمام أحمد بن حنبل مؤسسة تعليمية أكاديمية إسلامية على منهج السلف الصالح.
        </p>
      </div>

      <section className="about-block">
        <h2>رسالة المجمع</h2>
        <p>
          مجمع الإمام أحمد بن حنبل مؤسسة تعليمية أكاديمية إسلامية تهدف إلى نشر العلم الشرعي
          على منهج السلف الصالح، وفق فهم الإمام أحمد بن حنبل ومنهج أهل السنة والجماعة.
        </p>
        <p>
          يسعى المجمع إلى تقديم محتوى علمي موثوق من محاضرات ودروس ومقالات وكتب،
          تخدم طالب العلم والباحث والمهتم بعلوم الشريعة.
        </p>
      </section>

      <section className="about-block about-sheikh">
        <div className="about-sheikh-content">
          <h2>الشيخ شعبان العودة</h2>
          <p>
            الشيخ شعبان العودة — حفظه الله — عالم ومربٍّ على منهج السلف،
            يُشرف على مجمع الإمام أحمد بن حنبل ويقدّم من خلاله دروساً ومحاضرات
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
