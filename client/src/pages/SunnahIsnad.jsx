import { Link, useSearchParams } from 'react-router-dom';
import './LectureCategories.css';

const SUNNAH_WHATSAPP = '201157761521';

const whatsappLink = (message) =>
  `https://wa.me/${SUNNAH_WHATSAPP}?text=${encodeURIComponent(message)}`;

const SunnahIsnad = () => {
  const [params] = useSearchParams();
  const book = (params.get('book') || '').trim();
  // Name the book when we know it so the message reads naturally either way.
  const studiedBook = book ? `كتاب ${book}` : 'الكتاب الذي أدرسه';
  const finishedBook = book ? `كتاب ${book}` : 'الكتاب';

  return (
    <div className="categories-page">
      <div className="categories-hero">
        <div className="categories-hero-inner">
          <div className="list-breadcrumb" style={{ marginBottom: '15px' }}>
            <Link to="/">الرئيسية</Link>
            <span>/</span>
            <Link to="/sunnah-reading">مقرأة السنة</Link>
            <span>/</span>
            <Link to="/sunnah-reading/books">كتب السنة</Link>
            <span>/</span>
            <span className="current">الإسناد</span>
          </div>
          <h1>{book ? `إسناد ${book}` : 'الحصول على إسناد متصل'}</h1>
          <p>شروط الحصول على إسناد متصل للكتاب</p>
        </div>
      </div>

      <div className="categories-content">
        <div className="sunnah-isnad-card">
          <p className="sunnah-subscribe-label">المطلوب:</p>
          <ol className="sunnah-requirements-list">
            <li>
              التسجيل بالموقع{' '}
              <Link className="sunnah-inline-link" to="/register">
                (اضغط هنا)
              </Link>
              .
            </li>
            <li>سماع كل الدروس.</li>
            <li>الإجابة عن أسئلة كل مجلس.</li>
            <li>
              إرسال صور لتعليقاتك على الكتاب الذي تدرسه [لا يزيد عن 10 صور]{' '}
              <a
                className="sunnah-inline-link"
                href={whatsappLink(
                  `السلام عليكم، أرسل لكم صور تعليقاتي على ${studiedBook} في مقرأة السنة.`
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                [ترسل هنا (اضغط هنا)]
              </a>
              .
            </li>
            <li>
              المراسلة بعد الانتهاء للحصول على الإسناد للكتاب الذي تم دراسته{' '}
              <a
                className="sunnah-inline-link"
                href={whatsappLink(
                  `السلام عليكم، انتهيت من دراسة ${finishedBook} وأرغب في الحصول على الإسناد.`
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                (اضغط هنا)
              </a>
              .
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SunnahIsnad;
