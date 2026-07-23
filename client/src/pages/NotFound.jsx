import { Link } from 'react-router-dom';

const NotFound = () => (
  <div
    style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
      fontFamily: 'inherit',
    }}
  >
    <div
      style={{
        fontSize: '7rem',
        fontWeight: 800,
        lineHeight: 1,
        background: 'linear-gradient(135deg, #6b4f2c, #c8a96e)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '0.5rem',
      }}
    >
      404
    </div>
    <h1
      style={{
        fontSize: '1.6rem',
        color: '#4a3520',
        marginBottom: '0.75rem',
        fontWeight: 700,
      }}
    >
      الصفحة غير موجودة
    </h1>
    <p
      style={{
        color: '#8a7560',
        fontSize: '1.05rem',
        maxWidth: 420,
        marginBottom: '1.5rem',
        lineHeight: 1.7,
      }}
    >
      عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. يمكنك العودة
      للصفحة الرئيسية.
    </p>
    <Link
      to="/"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '0.75rem 2rem',
        background: 'linear-gradient(135deg, #6b4f2c, #8b6e45)',
        color: '#fff',
        borderRadius: 10,
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '1rem',
        boxShadow: '0 4px 14px rgba(107,79,44,0.25)',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(107,79,44,0.35)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 14px rgba(107,79,44,0.25)';
      }}
    >
      ← العودة للرئيسية
    </Link>
  </div>
);

export default NotFound;
