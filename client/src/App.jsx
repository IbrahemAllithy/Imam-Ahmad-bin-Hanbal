import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/ui/Loader';

/* ── Lazy-loaded pages ─────────────────────────────────── */
const Home = lazy(() => import('./pages/Home'));
const LectureCategories = lazy(() => import('./pages/LectureCategories'));
const Lectures = lazy(() => import('./pages/Lectures'));
const LectureDetail = lazy(() => import('./pages/LectureDetail'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));
const Articles = lazy(() => import('./pages/Articles'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const Books = lazy(() => import('./pages/Books'));
const BookDetail = lazy(() => import('./pages/BookDetail'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Account = lazy(() => import('./pages/Account'));
const Certificates = lazy(() => import('./pages/Certificates'));
const CertificateView = lazy(() => import('./pages/CertificateView'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Search = lazy(() => import('./pages/Search'));
const StartHere = lazy(() => import('./pages/StartHere'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

/* ── Scroll to top on navigation ───────────────────────── */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, search]);

  return null;
};

/* ── App ───────────────────────────────────────────────── */
const App = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="app">
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <main className="main-content">
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* ── Public pages ────────────────────────── */}
            <Route path="/" element={<Home />} />
            <Route path="/lectures" element={<Lectures />} />
            <Route path="/lectures/categories" element={<LectureCategories />} />
            <Route path="/lectures/list" element={<Lectures />} />
            <Route path="/courses/:seriesName" element={<CourseDetail />} />
            <Route path="/lectures/:id" element={<LectureDetail />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
            <Route path="/books" element={<Books />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/search" element={<Search />} />
            <Route path="/start" element={<StartHere />} />

            {/* ── Auth pages (guest only) ─────────────── */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* ── Protected student pages ─────────────── */}
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />
            <Route path="/certificates/:id" element={<ProtectedRoute><CertificateView /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

            {/* ── Admin pages ─────────────────────────── */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* ── 404 catch-all ───────────────────────── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
};

export default App;
