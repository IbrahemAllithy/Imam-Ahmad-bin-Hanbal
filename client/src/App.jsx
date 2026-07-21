import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import LectureCategories from './pages/LectureCategories';
import Lectures from './pages/Lectures';
import LectureDetail from './pages/LectureDetail';
import CourseDetail from './pages/CourseDetail';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

const App = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="app">
      {!isAdmin && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lectures" element={<LectureCategories />} />
          <Route path="/lectures/list" element={<Lectures />} />
          <Route path="/courses/:seriesName" element={<CourseDetail />} />
          <Route path="/lectures/:id" element={<LectureDetail />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:id" element={<ArticleDetail />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
};

export default App;
