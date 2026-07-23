import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { FiPrinter, FiChevronRight } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';
import Loader from '../components/ui/Loader';
import './PlatformPages.css';

const CertificateView = () => {
  const { id } = useParams();
  const { user, loading: authLoading, isStudent, isAdmin } = useAuth();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchCert = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/certificates/${id}`);
        setCert(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'الشهادة غير موجودة');
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [id, user]);

  if (authLoading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isStudent && !isAdmin) return <Navigate to="/login" replace />;

  const studentName = cert?.user?.name || user.name;

  return (
    <div className="platform-page">
      <div className="container">
        <Link to="/certificates" className="no-print" style={{ color: 'var(--text-muted)', marginBottom: '1rem', display: 'inline-block' }}>
          <FiChevronRight style={{ verticalAlign: 'middle' }} /> العودة للشهادات
        </Link>

        {loading && <Loader />}
        {error && <div className="alert alert-error">{error}</div>}

        {cert && (
          <>
            <div className="cert-print-area" id="certificate-print">
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>شهادة إتمام دورة</p>
              <h2>{cert.series}</h2>
              <p style={{ fontSize: '1.25rem', margin: '1.5rem 0' }}>
                تشهد إدارة المجمع أن الطالب/ة
              </p>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-text)' }}>
                {studentName}
              </p>
              <p style={{ margin: '1.5rem 0' }}>
                قد أتم/ت جميع دروس هذه الدورة بنجاح
              </p>
              <p style={{ color: 'var(--text-muted)' }}>
                تاريخ الإصدار: {formatDate(cert.issuedAt || cert.createdAt)}
              </p>
              <div className="cert-code">{cert.code}</div>
            </div>

            <button
              type="button"
              className="btn btn-primary no-print"
              onClick={() => window.print()}
            >
              <FiPrinter style={{ marginLeft: 8 }} />
              طباعة الشهادة
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CertificateView;
