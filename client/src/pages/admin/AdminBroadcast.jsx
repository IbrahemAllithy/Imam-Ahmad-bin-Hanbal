import { useState } from 'react';
import { FiSend, FiUsers, FiMail, FiBell, FiCheckCircle } from 'react-icons/fi';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import './Admin.css';

const AdminBroadcast = () => {
  const { showSuccess, showError } = useToast();
  const { data: studentsData } = useFetch('/admin/students');
  const students = studentsData?.data || [];
  const verifiedCount = students.filter((s) => s.isEmailVerified).length;

  const [form, setForm] = useState({
    title: '',
    body: '',
    link: '',
    type: 'system',
    sendEmail: true,
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      showError('يرجى كتابة عنوان الرسالة ونصها');
      return;
    }

    if (!window.confirm(`هل أنت متأكد من إرسال الرسالة إلى ${students.length} طالب؟`)) {
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/notifications/broadcast', form);
      showSuccess(data.message || 'تم إرسال الإشعار والبريد بنجاح');
      setForm({
        title: '',
        body: '',
        link: '',
        type: 'system',
        sendEmail: true,
      });
    } catch (err) {
      showError(err.response?.data?.message || 'فشل إرسال البث الجماعي');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-broadcast-page">
      <div className="admin-page-header">
        <div>
          <h2>الرسائل والإشعارات الجماعية</h2>
          <p>إرسال إشعارات مباشرة بالموقع ورسائل بريدية لجميع الطلاب المسجلين</p>
        </div>
      </div>

      <div className="admin-overview-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fdf8ef', color: '#6b4f2c' }}>
            <FiUsers />
          </div>
          <div className="stat-info">
            <span className="stat-value">{students.length}</span>
            <span className="stat-label">إجمالي الطلاب المسجلين</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f1f8e9', color: '#2e7d32' }}>
            <FiMail />
          </div>
          <div className="stat-info">
            <span className="stat-value">{verifiedCount}</span>
            <span className="stat-label">حسابات مفعّلة جاهزة لاستقبال البريد</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        <form onSubmit={handleSubmit} className="admin-form-card">
          <h3 className="form-card-title">
            <FiSend /> إنشاء بث جماعي جديد
          </h3>

          <div className="form-group">
            <label>نوع الإشعار</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="form-input"
            >
              <option value="system">إعلان نظام / عام</option>
              <option value="lecture">درس جديد</option>
              <option value="book">كتاب جديد</option>
              <option value="article">مقال جديد</option>
              <option value="certificate">تنويه شهادات</option>
            </select>
          </div>

          <div className="form-group">
            <label>عنوان الإشعار <span style={{ color: '#d32f2f' }}>*</span></label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="مثال: تم رفع المحاضرة الأخيرة من شرح كتاب التوحيد"
            />
          </div>

          <div className="form-group">
            <label>نص الرسالة والبيان <span style={{ color: '#d32f2f' }}>*</span></label>
            <textarea
              rows={5}
              required
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="اكتب تفاصيل الإعلان أو التنبيه هنا..."
            />
          </div>

          <div className="form-group">
            <label>رابط التوجيه (اختياري)</label>
            <input
              type="text"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="مثال: /lectures أو /books/123"
            />
            <small style={{ color: 'var(--text-muted)' }}>
              يستطيع الطالب النقر عليه من التنبيه للانتقال للمحتوى فوراً
            </small>
          </div>

          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <input
              type="checkbox"
              id="sendEmail"
              checked={form.sendEmail}
              onChange={(e) => setForm({ ...form, sendEmail: e.target.checked })}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
            <label htmlFor="sendEmail" style={{ cursor: 'pointer', margin: 0, fontWeight: 600 }}>
              📧 إرسال نسخة إلى البريد الإلكتروني للطلاب المفعّلين
            </label>
          </div>

          <div className="form-actions-bar">
            <button type="submit" className="btn-admin-submit" disabled={submitting}>
              <FiSend /> {submitting ? 'جاري الإرسال...' : 'إرسال البث للجميع'}
            </button>
          </div>
        </form>

        <div className="admin-form-card" style={{ background: 'var(--primary-bg)' }}>
          <h3 className="form-card-title">
            <FiBell /> معاينة شكل الإشعار لدى الطالب
          </h3>

          <div
            style={{
              background: '#fff',
              border: '1px solid #e8dfd0',
              borderRadius: 12,
              padding: 16,
              boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span
                style={{
                  background: '#f9f5ed',
                  color: '#6b4f2c',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {form.type}
              </span>
              <span style={{ fontSize: 12, color: '#888' }}>الآن</span>
            </div>

            <h4 style={{ margin: '0 0 6px 0', color: '#6b4f2c', fontSize: 16 }}>
              {form.title || 'عنوان الرسالة المعاينة'}
            </h4>

            <p style={{ margin: '0 0 12px 0', color: '#555', fontSize: 14, whiteSpace: 'pre-wrap' }}>
              {form.body || 'سيظهر نص الرسالة المفصل للطلاب بهذا الشكل في قائمة الإشعارات والبريد...'}
            </p>

            {form.link && (
              <span style={{ fontSize: 13, color: '#6b4f2c', fontWeight: 700, textDecoration: 'underline' }}>
                رابط التوجيه: {form.link}
              </span>
            )}
          </div>

          <div
            style={{
              marginTop: 20,
              padding: 12,
              background: '#e8f5e9',
              border: '1px solid #c8e6c9',
              borderRadius: 8,
              fontSize: 13,
              color: '#2e7d32',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <FiCheckCircle style={{ fontSize: 16 }} />
            <span>سيتم إنشاء إشعار بالموقع لجميع الطلاب المسجلين تلقائياً عند الضغط على إرسال.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBroadcast;
