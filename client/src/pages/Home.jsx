import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { sheikh } from '../assets';
import LectureCard from '../components/lectures/LectureCard';
import ArticleCard from '../components/articles/ArticleCard';
import BookCard from '../components/books/BookCard';
import SectionTitle from '../components/ui/SectionTitle';
import Loader from '../components/ui/Loader';
import './Home.css';

const Home = () => {
  const { data: lectures, loading: l1 } = useFetch('/lectures', { limit: 3 });
  const { data: articles, loading: l2 } = useFetch('/articles', { limit: 3 });
  const { data: books, loading: l3 } = useFetch('/books', { limit: 3 });

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <span className="hero-badge">موقع تعليمي أكاديمي</span>
            <h1>مجمع الإمام أحمد بن حنبل</h1>
            <p>
              منارة علمية على منهج السلف الصالح — محاضرات ودروس ومقالات وكتب
              تابع للشيخ شعبان العودة — حفظه الله.
            </p>
            <div className="hero-actions">
              <Link to="/lectures" className="btn btn-gold">استمع للمحاضرات</Link>
              <Link to="/about" className="btn btn-outline hero-outline">تعرّف على المجمع</Link>
            </div>
          </div>
          <div className="hero-visual">
            <img
              src={sheikh}
              alt="الشيخ شعبان العودة — حفظه الله"
              className="hero-sheikh"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle title="أحدث المحاضرات" subtitle="دروس ومحاضرات علمية على يوتيوب" />
          {l1 ? <Loader /> : (
            <>
              <div className="grid grid-3">
                {lectures?.data?.map((l) => <LectureCard key={l._id} lecture={l} />)}
              </div>
              {!lectures?.data?.length && <p className="empty-state">لا توجد محاضرات بعد</p>}
              <div className="section-link">
                <Link to="/lectures" className="btn btn-outline">عرض كل المحاضرات</Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <SectionTitle title="أحدث المقالات" subtitle="مقالات علمية ودعوية" />
          {l2 ? <Loader /> : (
            <>
              <div className="grid grid-3">
                {articles?.data?.map((a) => <ArticleCard key={a._id} article={a} />)}
              </div>
              {!articles?.data?.length && <p className="empty-state">لا توجد مقالات بعد</p>}
              <div className="section-link">
                <Link to="/articles" className="btn btn-outline">عرض كل المقالات</Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle title="مكتبة الكتب" subtitle="كتب PDF للقراءة والتحميل" />
          {l3 ? <Loader /> : (
            <>
              <div className="grid grid-3">
                {books?.data?.map((b) => <BookCard key={b._id} book={b} />)}
              </div>
              {!books?.data?.length && <p className="empty-state">لا توجد كتب بعد</p>}
              <div className="section-link">
                <Link to="/books" className="btn btn-outline">عرض كل الكتب</Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="about-snippet">
        <div className="container about-snippet-inner">
          <h2>عن المجمع</h2>
          <p>
            مجمع الإمام أحمد بن حنبل مؤسسة تعليمية إسلامية تهدف إلى نشر العلم الشرعي
            على منهج أهل السنة والجماعة، بإشراف الشيخ شعبان العودة.
          </p>
          <Link to="/about" className="btn btn-primary">اقرأ المزيد</Link>
        </div>
      </section>
    </>
  );
};

export default Home;
