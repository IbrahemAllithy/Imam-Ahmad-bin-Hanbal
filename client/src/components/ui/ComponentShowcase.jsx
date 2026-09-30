import { useState } from 'react';
import './ComponentShowcase.css';

/**
 * Component Library Showcase
 * مكتبة المكونات - عرض جميع المكونات القابلة لإعادة الاستخدام
 */
export default function ComponentShowcase() {
  const [activeTab, setActiveTab] = useState('buttons');
  const [toastVisible, setToastVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <div className="showcase-page">
      <div className="showcase-header">
        <h1>مكتبة المكونات</h1>
        <p>عرض شامل لجميع المكونات القابلة لإعادة الاستخدام في المشروع</p>
      </div>

      <div className="showcase-tabs">
        <button
          className={`tab-btn ${activeTab === 'buttons' ? 'active' : ''}`}
          onClick={() => setActiveTab('buttons')}
        >
          الأزرار
        </button>
        <button
          className={`tab-btn ${activeTab === 'cards' ? 'active' : ''}`}
          onClick={() => setActiveTab('cards')}
        >
          البطاقات
        </button>
        <button
          className={`tab-btn ${activeTab === 'forms' ? 'active' : ''}`}
          onClick={() => setActiveTab('forms')}
        >
          النماذج
        </button>
        <button
          className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          التغذية الراجعة
        </button>
      </div>

      <div className="showcase-content">
        {activeTab === 'buttons' && (
          <section className="showcase-section">
            <h2>الأزرار / Buttons</h2>

            <div className="component-group">
              <h3>Primary Buttons</h3>
              <div className="button-row">
                <button className="btn btn-primary">زر أساسي</button>
                <button className="btn btn-primary" disabled>معطل</button>
                <button className="btn btn-primary btn-sm">صغير</button>
                <button className="btn btn-primary btn-lg">كبير</button>
              </div>
            </div>

            <div className="component-group">
              <h3>Secondary Buttons</h3>
              <div className="button-row">
                <button className="btn btn-secondary">زر ثانوي</button>
                <button className="btn btn-secondary" disabled>معطل</button>
                <button className="btn btn-outline">حدود فقط</button>
              </div>
            </div>

            <div className="component-group">
              <h3>Icon Buttons</h3>
              <div className="button-row">
                <button className="btn btn-icon">
                  <span>⚙️</span>
                </button>
                <button className="btn btn-icon btn-round">
                  <span>❤️</span>
                </button>
                <button className="btn btn-icon btn-ghost">
                  <span>🔔</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'cards' && (
          <section className="showcase-section">
            <h2>البطاقات / Cards</h2>

            <div className="component-group">
              <h3>Basic Card</h3>
              <div className="card">
                <div className="card-header">
                  <h3>عنوان البطاقة</h3>
                </div>
                <div className="card-body">
                  <p>محتوى البطاقة يظهر هنا. يمكن أن يحتوي على نص، صور، أزرار، وأي عناصر أخرى.</p>
                </div>
                <div className="card-footer">
                  <button className="btn btn-sm btn-primary">إجراء</button>
                </div>
              </div>
            </div>

            <div className="component-group">
              <h3>Media Card</h3>
              <div className="card card-media">
                <div className="card-image">
                  <div className="placeholder-img">صورة</div>
                </div>
                <div className="card-body">
                  <span className="card-badge">جديد</span>
                  <h3>عنوان البطاقة</h3>
                  <p>وصف مختصر للمحتوى</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'forms' && (
          <section className="showcase-section">
            <h2>عناصر النماذج / Form Elements</h2>

            <div className="component-group">
              <h3>Text Inputs</h3>
              <div className="form-group">
                <label>حقل نصي عادي</label>
                <input type="text" className="form-input" placeholder="أدخل النص هنا" />
              </div>

              <div className="form-group">
                <label>حقل مع خطأ</label>
                <input type="text" className="form-input error" />
                <span className="form-error">هذا الحقل مطلوب</span>
              </div>

              <div className="form-group">
                <label>منطقة نصية</label>
                <textarea className="form-input" rows="4" placeholder="أدخل نصاً طويلاً"></textarea>
              </div>
            </div>

            <div className="component-group">
              <h3>Select & Checkbox</h3>
              <div className="form-group">
                <label>قائمة منسدلة</label>
                <select className="form-input">
                  <option>اختر خياراً</option>
                  <option>الخيار الأول</option>
                  <option>الخيار الثاني</option>
                  <option>الخيار الثالث</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>أوافق على الشروط والأحكام</span>
                </label>
              </div>

              <div className="form-group">
                <label className="radio-label">
                  <input type="radio" name="choice" />
                  <span>الخيار الأول</span>
                </label>
                <label className="radio-label">
                  <input type="radio" name="choice" />
                  <span>الخيار الثاني</span>
                </label>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'feedback' && (
          <section className="showcase-section">
            <h2>عناصر التغذية الراجعة / Feedback</h2>

            <div className="component-group">
              <h3>Alerts</h3>
              <div className="alert alert-success">
                <span className="alert-icon">✓</span>
                <span>تم الحفظ بنجاح!</span>
              </div>
              <div className="alert alert-error">
                <span className="alert-icon">✕</span>
                <span>حدث خطأ أثناء العملية</span>
              </div>
              <div className="alert alert-warning">
                <span className="alert-icon">⚠</span>
                <span>يرجى التحقق من البيانات</span>
              </div>
              <div className="alert alert-info">
                <span className="alert-icon">ℹ</span>
                <span>معلومة مفيدة للمستخدم</span>
              </div>
            </div>

            <div className="component-group">
              <h3>Badges</h3>
              <div className="badge-row">
                <span className="badge badge-primary">أساسي</span>
                <span className="badge badge-success">مكتمل</span>
                <span className="badge badge-error">خطأ</span>
                <span className="badge badge-warning">تحذير</span>
                <span className="badge badge-info">معلومة</span>
              </div>
            </div>

            <div className="component-group">
              <h3>Loading States</h3>
              <div className="loader-row">
                <div className="spinner"></div>
                <div className="spinner spinner-sm"></div>
                <div className="skeleton-text"></div>
              </div>
            </div>

            <div className="component-group">
              <h3>Toast & Modal</h3>
              <div className="button-row">
                <button className="btn btn-primary" onClick={() => setToastVisible(true)}>
                  عرض Toast
                </button>
                <button className="btn btn-secondary" onClick={() => setModalVisible(true)}>
                  فتح Modal
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {toastVisible && (
        <div className="toast toast-success">
          <span>عملية ناجحة!</span>
          <button onClick={() => setToastVisible(false)}>✕</button>
        </div>
      )}

      {modalVisible && (
        <div className="modal-overlay" onClick={() => setModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>عنوان النافذة المنبثقة</h3>
              <button className="modal-close" onClick={() => setModalVisible(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>محتوى النافذة المنبثقة يظهر هنا.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalVisible(false)}>
                إلغاء
              </button>
              <button className="btn btn-primary" onClick={() => setModalVisible(false)}>
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
