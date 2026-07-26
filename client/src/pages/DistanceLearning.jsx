import { useState } from 'react';
import { FiMonitor, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';
import './PlatformPages.css';
import './Contact.css';

const programs = [
  {
    title: 'مسار العقيدة',
    desc: 'دراسة منظمة لأصول الاعتقاد عبر لقاءات دورية ومتابعة مباشرة.',
  },
  {
    title: 'مسار الفقه',
    desc: 'برنامج متدرج في الفقه وأصوله بإشراف ومتابعة للطلاب.',
  },
  {
    title: 'مسار الحديث والتفسير',
    desc: 'قراءة وشرح للمتون مع تقييم دوري لمستوى الطالب.',
  },
];

const DistanceLearning = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', program: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const { data } = await api.post('/contact', {
        name: form.name,
        email: form.email,
        subject: 'تسجيل - التعلم عن بعد',
        message: `المسار المطلوب: ${form.program || 'غير محدد'}\nرقم الهاتف: ${form.phone || 'غير مذكور'}`,
      });
      setStatus({ type: 'success', message: data.message });
      setForm({ name: '', email: '', phone: '', program: '' });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'حدث خطأ — حاول مجدداً',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="platform-page">
      <div className="container">
        <div className="platform-header">
          <h1>
            <FiMonitor style={{ marginLeft: 10, verticalAlign: 'middle' }} />
            التعلم عن بعد
          </h1>
          <p>برامج دراسية منظمة عن بعد بمتابعة ومراجعة مستمرة</p>
        </div>

        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2.5rem' }}>
          {programs.map((p) => (
            <div className="platform-card" key={p.title}>
              <h3>
                <FiCheckCircle style={{ color: 'var(--accent-color)', marginLeft: 8, verticalAlign: 'middle' }} />
                {p.title}
              </h3>
              <p className="platform-card-meta" style={{ marginBottom: 0 }}>{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="contact-page" style={{ padding: 0 }}>
          <form onSubmit={handleSubmit} className="contact-form">
            <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', color: 'var(--primary-text)' }}>
              سجّل اهتمامك بالبرنامج
            </h3>

            {status.message && (
              <div className={`alert alert-${status.type}`}>{status.message}</div>
            )}

            <div className="form-group">
              <label htmlFor="name">الاسم <span style={{ color: '#d32f2f' }}>*</span></label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required maxLength={100} placeholder="أدخل اسمك الكريم" />
            </div>

            <div className="form-group">
              <label htmlFor="email">البريد الإلكتروني <span style={{ color: '#d32f2f' }}>*</span></label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="example@mail.com" />
            </div>

            <div className="form-group">
              <label htmlFor="phone">رقم الهاتف</label>
              <input id="phone" name="phone" value={form.phone} onChange={handleChange} maxLength={30} placeholder="رقم للتواصل (اختياري)" />
            </div>

            <div className="form-group">
              <label htmlFor="program">المسار المطلوب</label>
              <select
                id="program"
                name="program"
                value={form.program}
                onChange={handleChange}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '0.85rem 1rem',
                  fontFamily: 'var(--font-body)',
                  fontSize: '1rem',
                  color: 'var(--text-dark)',
                  backgroundColor: 'var(--primary-bg)',
                  border: '1.5px solid var(--primary-border)',
                  borderRadius: 10,
                  direction: 'rtl',
                }}
              >
                <option value="">اختر المسار</option>
                {programs.map((p) => (
                  <option key={p.title} value={p.title}>{p.title}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'جاري الإرسال...' : 'تسجيل الاهتمام'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DistanceLearning;
