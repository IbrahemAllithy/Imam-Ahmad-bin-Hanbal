import { useEffect, useState } from 'react';
import { FiCheck, FiPlus, FiTrash2, FiSettings } from 'react-icons/fi';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { DEFAULT_SITE_SETTINGS } from '../../utils/defaultSiteSettings';
import './Admin.css';

const SECTIONS = [
  { id: 'branding', label: 'الهوية' },
  { id: 'home', label: 'الرئيسية' },
  { id: 'about', label: 'عن الشيخ' },
  { id: 'nav', label: 'القائمة والفوتر' },
  { id: 'categories', label: 'التصنيفات' },
  { id: 'contact', label: 'التواصل' },
];

const clone = (value) => JSON.parse(JSON.stringify(value));

const AdminSettings = () => {
  const { settings, saveSettings, sheikhImage, logoImage } = useSiteSettings();
  const [form, setForm] = useState(() => clone(settings));
  const [section, setSection] = useState('branding');
  const [logoFile, setLogoFile] = useState(null);
  const [sheikhFile, setSheikhFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(clone(settings));
  }, [settings]);

  const updatePath = (path, value) => {
    setForm((prev) => {
      const next = clone(prev);
      const keys = path.split('.');
      let cursor = next;
      for (let i = 0; i < keys.length - 1; i += 1) {
        cursor = cursor[keys[i]];
      }
      cursor[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const result = await saveSettings(form, {
        logo: logoFile,
        sheikhImage: sheikhFile,
      });
      setLogoFile(null);
      setSheikhFile(null);
      setSuccess(
        result.source === 'api'
          ? 'تم حفظ إعدادات الموقع بنجاح ✓'
          : result.message || 'تم الحفظ محلياً ✓'
      );
    } catch (err) {
      setError(err.response?.data?.message || 'فشل حفظ الإعدادات');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm('إعادة الإعدادات إلى القيم الافتراضية؟')) return;
    setForm(clone(DEFAULT_SITE_SETTINGS));
    setSuccess('تم استرجاع القيم الافتراضية — احفظ لتطبيقها');
  };

  return (
    <div className="admin-settings-page">
      <div className="admin-page-header">
        <div>
          <h2>إعدادات الموقع</h2>
          <p>تحكم في الهوية والنصوص والتصنيفات والقوائم من مكان واحد</p>
        </div>
      </div>

      <div className="settings-tabs">
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={section === item.id ? 'active' : ''}
            onClick={() => setSection(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="admin-form-card">
        <h3 className="form-card-title">
          <FiSettings /> {SECTIONS.find((s) => s.id === section)?.label}
        </h3>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {section === 'branding' && (
          <div className="form-grid">
            <div className="form-group">
              <label>اسم الموقع</label>
              <input
                value={form.branding.siteName}
                onChange={(e) => updatePath('branding.siteName', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>العنوان الفرعي</label>
              <input
                value={form.branding.siteSubtitle}
                onChange={(e) => updatePath('branding.siteSubtitle', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>عنوان المتصفح (SEO)</label>
              <input
                value={form.branding.metaTitle}
                onChange={(e) => updatePath('branding.metaTitle', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>وصف الموقع (SEO)</label>
              <input
                value={form.branding.metaDescription}
                onChange={(e) => updatePath('branding.metaDescription', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>شعار الموقع</label>
              <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setLogoFile(e.target.files[0])} />
              <img src={logoFile ? URL.createObjectURL(logoFile) : logoImage} alt="الشعار" className="settings-preview-img" />
            </div>
            <div className="form-group">
              <label>صورة الشيخ</label>
              <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setSheikhFile(e.target.files[0])} />
              <img src={sheikhFile ? URL.createObjectURL(sheikhFile) : sheikhImage} alt="الشيخ" className="settings-preview-img" />
            </div>
          </div>
        )}

        {section === 'home' && (
          <>
            <div className="form-grid">
              <div className="form-group">
                <label>شارة الهيرو</label>
                <input value={form.hero.badge} onChange={(e) => updatePath('hero.badge', e.target.value)} />
              </div>
              <div className="form-group">
                <label>عنوان الهيرو (سطر جديد بـ Enter)</label>
                <textarea
                  rows={3}
                  value={form.hero.title}
                  onChange={(e) => updatePath('hero.title', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>وصف الهيرو</label>
                <textarea
                  rows={3}
                  value={form.hero.description}
                  onChange={(e) => updatePath('hero.description', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>نص الزر الرئيسي</label>
                <input value={form.hero.primaryCtaText} onChange={(e) => updatePath('hero.primaryCtaText', e.target.value)} />
              </div>
              <div className="form-group">
                <label>رابط الزر الرئيسي</label>
                <input value={form.hero.primaryCtaLink} onChange={(e) => updatePath('hero.primaryCtaLink', e.target.value)} />
              </div>
              <div className="form-group">
                <label>نص الزر الثانوي</label>
                <input value={form.hero.secondaryCtaText} onChange={(e) => updatePath('hero.secondaryCtaText', e.target.value)} />
              </div>
              <div className="form-group">
                <label>رابط الزر الثانوي</label>
                <input value={form.hero.secondaryCtaLink} onChange={(e) => updatePath('hero.secondaryCtaLink', e.target.value)} />
              </div>
            </div>

            <h4 className="settings-subtitle">تعريف الشيخ في الرئيسية</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>العنوان</label>
                <input value={form.homeAbout.title} onChange={(e) => updatePath('homeAbout.title', e.target.value)} />
              </div>
              <div className="form-group">
                <label>الاسم الكامل</label>
                <input value={form.homeAbout.subtitle} onChange={(e) => updatePath('homeAbout.subtitle', e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>النقاط (سطر لكل نقطة)</label>
                <textarea
                  rows={3}
                  value={(form.homeAbout.bullets || []).join('\n')}
                  onChange={(e) =>
                    updatePath(
                      'homeAbout.bullets',
                      e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)
                    )
                  }
                />
              </div>
            </div>

            <h4 className="settings-subtitle">الإحصائيات</h4>
            {(form.homeAbout.stats || []).map((stat, idx) => (
              <div className="form-grid" key={`stat-${idx}`}>
                <div className="form-group">
                  <label>القيمة</label>
                  <input
                    value={stat.value}
                    onChange={(e) => {
                      const stats = [...form.homeAbout.stats];
                      stats[idx] = { ...stats[idx], value: e.target.value };
                      updatePath('homeAbout.stats', stats);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>التسمية</label>
                  <input
                    value={stat.label}
                    onChange={(e) => {
                      const stats = [...form.homeAbout.stats];
                      stats[idx] = { ...stats[idx], label: e.target.value };
                      updatePath('homeAbout.stats', stats);
                    }}
                  />
                </div>
              </div>
            ))}

            <h4 className="settings-subtitle">الإعلانات</h4>
            <div className="form-group">
              <textarea
                rows={4}
                value={(form.announcements || []).join('\n')}
                onChange={(e) =>
                  updatePath(
                    'announcements',
                    e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)
                  )
                }
                placeholder="إعلان في كل سطر"
              />
            </div>

            <h4 className="settings-subtitle">روابط الاستكشاف</h4>
            {(form.exploreLinks || []).map((link, idx) => (
              <div className="form-grid" key={`explore-${idx}`}>
                <div className="form-group">
                  <label>النص</label>
                  <input
                    value={link.label}
                    onChange={(e) => {
                      const links = [...form.exploreLinks];
                      links[idx] = { ...links[idx], label: e.target.value };
                      updatePath('exploreLinks', links);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>الرابط</label>
                  <input
                    value={link.href}
                    onChange={(e) => {
                      const links = [...form.exploreLinks];
                      links[idx] = { ...links[idx], href: e.target.value };
                      updatePath('exploreLinks', links);
                    }}
                  />
                </div>
              </div>
            ))}

            <h4 className="settings-subtitle">قسم التواصل في الرئيسية</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>العنوان</label>
                <input value={form.cta.title} onChange={(e) => updatePath('cta.title', e.target.value)} />
              </div>
              <div className="form-group">
                <label>نص الزر</label>
                <input value={form.cta.buttonText} onChange={(e) => updatePath('cta.buttonText', e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>الوصف</label>
                <textarea rows={3} value={form.cta.description} onChange={(e) => updatePath('cta.description', e.target.value)} />
              </div>
              <div className="form-group">
                <label>رابط الزر</label>
                <input value={form.cta.buttonLink} onChange={(e) => updatePath('cta.buttonLink', e.target.value)} />
              </div>
            </div>
          </>
        )}

        {section === 'about' && (
          <div className="form-grid">
            <div className="form-group">
              <label>عنوان الصفحة</label>
              <input value={form.aboutPage.headerTitle} onChange={(e) => updatePath('aboutPage.headerTitle', e.target.value)} />
            </div>
            <div className="form-group">
              <label>العنوان الفرعي</label>
              <input value={form.aboutPage.headerSubtitle} onChange={(e) => updatePath('aboutPage.headerSubtitle', e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>المقدمة</label>
              <textarea rows={3} value={form.aboutPage.intro} onChange={(e) => updatePath('aboutPage.intro', e.target.value)} />
            </div>
            <div className="form-group">
              <label>عنوان الرسالة</label>
              <input value={form.aboutPage.missionTitle} onChange={(e) => updatePath('aboutPage.missionTitle', e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>فقرات الرسالة (سطر لكل فقرة)</label>
              <textarea
                rows={4}
                value={(form.aboutPage.missionParagraphs || []).join('\n')}
                onChange={(e) =>
                  updatePath(
                    'aboutPage.missionParagraphs',
                    e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)
                  )
                }
              />
            </div>
            <div className="form-group">
              <label>عنوان قسم الشيخ</label>
              <input value={form.aboutPage.sheikhTitle} onChange={(e) => updatePath('aboutPage.sheikhTitle', e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>نبذة الشيخ</label>
              <textarea rows={4} value={form.aboutPage.sheikhBio} onChange={(e) => updatePath('aboutPage.sheikhBio', e.target.value)} />
            </div>
            <div className="form-group">
              <label>عنوان المحاور</label>
              <input value={form.aboutPage.valuesTitle} onChange={(e) => updatePath('aboutPage.valuesTitle', e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>محاور العمل (سطر لكل محور)</label>
              <textarea
                rows={4}
                value={(form.aboutPage.values || []).join('\n')}
                onChange={(e) =>
                  updatePath(
                    'aboutPage.values',
                    e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)
                  )
                }
              />
            </div>
          </div>
        )}

        {section === 'nav' && (
          <>
            <h4 className="settings-subtitle">روابط القائمة</h4>
            {(form.navbar.links || []).map((link, idx) => (
              <div className="form-grid settings-inline-row" key={`nav-${idx}`}>
                <div className="form-group">
                  <label>النص</label>
                  <input
                    value={link.label}
                    onChange={(e) => {
                      const links = [...form.navbar.links];
                      links[idx] = { ...links[idx], label: e.target.value };
                      updatePath('navbar.links', links);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>الرابط</label>
                  <input
                    value={link.to}
                    onChange={(e) => {
                      const links = [...form.navbar.links];
                      links[idx] = { ...links[idx], to: e.target.value };
                      updatePath('navbar.links', links);
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="btn-card-delete"
                  onClick={() => updatePath('navbar.links', form.navbar.links.filter((_, i) => i !== idx))}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => updatePath('navbar.links', [...form.navbar.links, { label: 'رابط جديد', to: '/' }])}
            >
              <FiPlus /> إضافة رابط
            </button>

            <div className="form-grid" style={{ marginTop: 20 }}>
              <div className="form-group">
                <label>نص زر التسجيل</label>
                <input value={form.navbar.ctaText} onChange={(e) => updatePath('navbar.ctaText', e.target.value)} />
              </div>
              <div className="form-group">
                <label>رابط زر التسجيل</label>
                <input value={form.navbar.ctaLink} onChange={(e) => updatePath('navbar.ctaLink', e.target.value)} />
              </div>
            </div>

            <h4 className="settings-subtitle">الفوتر</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>عنوان الفوتر</label>
                <input value={form.footer.title} onChange={(e) => updatePath('footer.title', e.target.value)} />
              </div>
              <div className="form-group">
                <label>البريد</label>
                <input value={form.footer.email} onChange={(e) => updatePath('footer.email', e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>وصف الفوتر</label>
                <textarea rows={3} value={form.footer.description} onChange={(e) => updatePath('footer.description', e.target.value)} />
              </div>
              <div className="form-group">
                <label>نص الحقوق</label>
                <input value={form.footer.copyrightSuffix} onChange={(e) => updatePath('footer.copyrightSuffix', e.target.value)} />
              </div>
            </div>

            <h4 className="settings-subtitle">روابط التواصل الاجتماعي</h4>
            {(form.footer.socialLinks || []).map((link, idx) => (
              <div className="form-grid" key={`social-${idx}`}>
                <div className="form-group">
                  <label>الاسم</label>
                  <input
                    value={link.label}
                    onChange={(e) => {
                      const links = [...form.footer.socialLinks];
                      links[idx] = { ...links[idx], label: e.target.value };
                      updatePath('footer.socialLinks', links);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>الرابط</label>
                  <input
                    value={link.url}
                    onChange={(e) => {
                      const links = [...form.footer.socialLinks];
                      links[idx] = { ...links[idx], url: e.target.value };
                      updatePath('footer.socialLinks', links);
                    }}
                    placeholder="https://..."
                  />
                </div>
              </div>
            ))}
          </>
        )}

        {section === 'categories' && (
          <>
            <p className="settings-hint">هذه التصنيفات تظهر في الرئيسية والقوائم ونماذج إضافة المحتوى.</p>
            {(form.categories || []).map((cat, idx) => (
              <div className="form-grid settings-inline-row" key={`cat-${idx}`}>
                <div className="form-group">
                  <label>الاسم</label>
                  <input
                    value={cat.name}
                    onChange={(e) => {
                      const cats = [...form.categories];
                      cats[idx] = { ...cats[idx], name: e.target.value };
                      updatePath('categories', cats);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>الحرف</label>
                  <input
                    value={cat.letter}
                    maxLength={2}
                    onChange={(e) => {
                      const cats = [...form.categories];
                      cats[idx] = { ...cats[idx], letter: e.target.value };
                      updatePath('categories', cats);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>العدد الظاهر</label>
                  <input
                    type="number"
                    min={0}
                    value={cat.count}
                    onChange={(e) => {
                      const cats = [...form.categories];
                      cats[idx] = { ...cats[idx], count: Number(e.target.value) || 0 };
                      updatePath('categories', cats);
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="btn-card-delete"
                  onClick={() => updatePath('categories', form.categories.filter((_, i) => i !== idx))}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline"
              onClick={() =>
                updatePath('categories', [
                  ...form.categories,
                  {
                    id: `cat-${Date.now()}`,
                    name: 'تصنيف جديد',
                    letter: 'ج',
                    count: 0,
                  },
                ])
              }
            >
              <FiPlus /> إضافة تصنيف
            </button>
          </>
        )}

        {section === 'contact' && (
          <div className="form-grid">
            <div className="form-group">
              <label>عنوان صفحة التواصل</label>
              <input
                value={form.contactPage.headerTitle}
                onChange={(e) => updatePath('contactPage.headerTitle', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>الوصف</label>
              <input
                value={form.contactPage.headerSubtitle}
                onChange={(e) => updatePath('contactPage.headerSubtitle', e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="form-actions-bar">
          <button type="submit" className="btn-admin-submit" disabled={submitting}>
            <FiCheck /> {submitting ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
          <button type="button" className="btn-admin-cancel" onClick={handleReset}>
            استرجاع الافتراضي
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
