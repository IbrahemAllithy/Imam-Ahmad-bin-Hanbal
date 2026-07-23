import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FiAward, FiChevronLeft } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import Loader from '../components/ui/Loader';
import './PlatformPages.css';
import './Auth.css';

const Certificates = () => {
  const { user, loading: authLoading, isStudent, isAdmin } = useAuth();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || (!isStudent && !isAdmin)) return;
    const fetchCerts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/certificates');
        setCerts(data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'تعذر تحميل الشهادات');
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, [user, isStudent, isAdmin]);

  if (authLoading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isStudent && !isAdmin) return <Navigate to="/login" replace />;

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>شهاداتي</h1>
          <p>شهادات إتمام الدورات التي أكملتها</p>
        </div>
      </div>

      <div className="platform-page">
        <div className="container">
          {error && <div className="alert alert-error">{error}</div>}
          {loading ? (
            <Loader />
          ) : certs.length ? (
            certs.map((cert) => (
              <Link
                key={cert._id}
                to={`/certificates/${cert._id}`}
                className="platform-card search-result-item"
              >
                <h3>
                  <FiAward style={{ marginLeft: 8 }} />
                  {cert.series}
                </h3>
                <div className="platform-card-meta">
                  تاريخ الإصدار: {formatDate(cert.issuedAt || cert.createdAt)}
                </div>
                <div className="cert-code">رمز الشهادة: {cert.code}</div>
                <span style={{ color: 'var(--accent-color)', fontWeight: 700 }}>
                  عرض الشهادة <FiChevronLeft style={{ verticalAlign: 'middle' }} />
                </span>
              </Link>
            ))
          ) : (
            <p className="platform-empty">
              لم تحصل على شهادات بعد. أكمل جميع دروس إحدى الدورات للحصول على شهادة.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Certificates;
