import { useState } from 'react';
import api from '../services/api';
import './Contact.css';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
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
      const { data } = await api.post('/contact', form);
      setStatus({ type: 'success', message: data.message });
      setForm({ name: '', email: '', subject: '', message: '' });
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
    <>
      <div className="page-header">
        <div className="container">
          <h1>تواصل معنا</h1>
          <p>نسعد باستقبال استفساراتكم ومقترحاتكم</p>
        </div>
      </div>

      <div className="container contact-page">
        <form onSubmit={handleSubmit} className="contact-form">
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
            <label htmlFor="subject">الموضوع</label>
            <input id="subject" name="subject" value={form.subject} onChange={handleChange} maxLength={200} placeholder="عنوان الاستفسار أو الرسالة" />
          </div>

          <div className="form-group">
            <label htmlFor="message">الرسالة <span style={{ color: '#d32f2f' }}>*</span></label>
            <textarea id="message" name="message" rows={6} value={form.message} onChange={handleChange} required maxLength={2000} placeholder="اكتب رسالتك أو استفسارك هنا..." />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'جاري إرسال الرسالة...' : 'إرسال الرسالة'}
          </button>
        </form>
      </div>
    </>
  );
};

export default Contact;
