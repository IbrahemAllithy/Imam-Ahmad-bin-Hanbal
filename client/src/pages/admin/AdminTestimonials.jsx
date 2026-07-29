import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getStorageUrl } from '../../services/api';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import { FiEdit2, FiTrash2, FiPlus, FiCheck, FiMessageSquare } from 'react-icons/fi';
import './Admin.css';

const emptyForm = { name: '', title: '', quote: '' };

// Must stay in step with the limits in server/middleware/upload.js — catching an oversized
// file here saves the admin from uploading it for minutes only to be refused at the end.
const MAX_VIDEO_MB = 150;
const MAX_PHOTO_MB = 5;
const VIDEO_EXTS = ['.mp4', '.webm', '.mov'];
const PHOTO_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

const extOf = (filename) => (filename.match(/\.[^.]+$/)?.[0] || '').toLowerCase();
const sizeMB = (file) => file.size / (1024 * 1024);

const AdminTestimonials = () => {
  const { data, loading, error: fetchError, refetch } = useFetch('/testimonials');
  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  // Bumped on reset to remount the file inputs — clearing React state alone leaves the
  // native inputs still showing the previous filename.
  const [fileInputKey, setFileInputKey] = useState(0);

  const items = data?.data || [];

  const resetForm = () => {
    setForm(emptyForm);
    setPhotoFile(null);
    setVideoFile(null);
    setEditId(null);
    setFileInputKey((k) => k + 1);
  };

  // Rejects the file in the picker rather than at submit time, so the reason is tied to the
  // field the admin just touched.
  const pickFile = (kind) => (e) => {
    const file = e.target.files?.[0] || null;
    const setFile = kind === 'video' ? setVideoFile : setPhotoFile;
    setError('');

    if (!file) return setFile(null);

    const allowedExts = kind === 'video' ? VIDEO_EXTS : PHOTO_EXTS;
    const maxMB = kind === 'video' ? MAX_VIDEO_MB : MAX_PHOTO_MB;
    const label = kind === 'video' ? 'الفيديو' : 'الصورة';

    if (!allowedExts.includes(extOf(file.name))) {
      e.target.value = '';
      setFile(null);
      return setError(`صيغة ${label} غير مدعومة — المسموح: ${allowedExts.join('، ')}`);
    }
    if (sizeMB(file) > maxMB) {
      e.target.value = '';
      setFile(null);
      return setError(
        `حجم ${label} ${sizeMB(file).toFixed(1)} ميجابايت — الحد الأقصى ${maxMB} ميجابايت. اضغط الملف أو اختر مقطعاً أقصر.`
      );
    }
    setFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim() || !form.quote.trim()) {
      setError('الاسم ونص الشهادة مطلوبان');
      return;
    }

    setSubmitting(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('title', form.title || '');
      formData.append('quote', form.quote);
      if (photoFile) formData.append('photo', photoFile);
      if (videoFile) formData.append('video', videoFile);

      // A video takes minutes on a slow connection; without this the page looks frozen.
      const config = {
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      };

      if (editId) {
        await api.put(`/testimonials/${editId}`, formData, config);
        setSuccess('تم تحديث الشهادة ✓');
      } else {
        await api.post('/testimonials', formData, config);
        setSuccess('تم إضافة الشهادة ✓');
      }
      resetForm();
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل الحفظ على السيرفر');
    } finally {
      setSubmitting(false);
      setProgress(0);
    }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setForm({ name: item.name || '', title: item.title || '', quote: item.quote || '' });
    setPhotoFile(null);
    setVideoFile(null);
    setFileInputKey((k) => k + 1);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الشهادة؟')) return;
    setError('');
    try {
      await api.delete(`/testimonials/${id}`);
      setSuccess('تم حذف الشهادة ✓');
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل الحذف على السيرفر');
    }
  };

  return (
    <div className="admin-books-page">
      <div className="admin-page-header">
        <div>
          <h2>قالوا عن الموقع</h2>
          <p>الشهادات اللي تظهر في صفحة "قالوا عن الموقع"</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-card">
        <h3 className="form-card-title">
          {editId ? <><FiEdit2 /> تعديل الشهادة الحالية</> : <><FiPlus /> إضافة شهادة جديدة</>}
        </h3>

        {(error || fetchError) && <div className="alert alert-error">{error || fetchError}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="form-grid">
          <div className="form-group">
            <label>الاسم *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: الشيخ فلان الفلاني"
            />
          </div>
          <div className="form-group">
            <label>الصفة / الوصف</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="مثال: عضو هيئة كبار العلماء"
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>نص الشهادة *</label>
          <textarea
            rows={3}
            value={form.quote}
            onChange={(e) => setForm({ ...form, quote: e.target.value })}
            placeholder="نص ما قاله عن الموقع..."
          />
        </div>

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>صورة (اختياري) — حتى {MAX_PHOTO_MB} ميجابايت</label>
          <input
            key={`photo-${fileInputKey}`}
            type="file"
            accept={PHOTO_EXTS.join(',')}
            onChange={pickFile('photo')}
          />
          {photoFile && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              الملف المختار: {photoFile.name} ({sizeMB(photoFile).toFixed(1)} م.ب)
            </span>
          )}
        </div>

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>فيديو (اختياري) — mp4 أو webm أو mov، حتى {MAX_VIDEO_MB} ميجابايت</label>
          <input
            key={`video-${fileInputKey}`}
            type="file"
            accept={VIDEO_EXTS.join(',')}
            onChange={pickFile('video')}
          />
          {videoFile && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              الملف المختار: {videoFile.name} ({sizeMB(videoFile).toFixed(1)} م.ب)
            </span>
          )}
          {editId && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              اترك الحقل فارغاً للإبقاء على الفيديو الحالي.
            </span>
          )}
        </div>

        {submitting && progress > 0 && (
          <div style={{ marginTop: '16px' }}>
            <div
              style={{
                height: 8,
                borderRadius: 4,
                background: 'var(--primary-border)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'var(--accent-color)',
                  transition: 'width 0.2s',
                }}
              />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {progress < 100 ? `جارٍ الرفع… ${progress}%` : 'تمت عملية الرفع، جارٍ الحفظ…'}
            </span>
          </div>
        )}

        <div className="form-actions-bar">
          <button type="submit" className="btn-admin-submit" disabled={submitting}>
            <FiCheck />{' '}
            {submitting ? 'جارٍ الحفظ…' : editId ? 'حفظ التعديلات' : 'إضافة الشهادة'}
          </button>
          {editId && (
            <button type="button" className="btn-admin-cancel" onClick={resetForm}>
              إلغاء التعديل
            </button>
          )}
        </div>
      </form>

      <div className="admin-list-section">
        <div className="list-section-header">
          <h3>الشهادات ({items.length})</h3>
        </div>

        {loading && !items.length ? (
          <Loader />
        ) : (
          <div className="admin-cards-grid">
            {items.map((item) => (
              <div key={item._id} className="admin-lecture-card">
                {item.photo && (
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      marginBottom: 10,
                    }}
                  >
                    <img
                      src={getStorageUrl(item.photo)}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <h4 className="card-lecture-title">
                  <FiMessageSquare style={{ verticalAlign: 'middle', marginLeft: 4 }} />
                  {item.name}
                </h4>
                {item.title && <p className="card-series-name">{item.title}</p>}
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>"{item.quote}"</p>
                {item.video && (
                  <video
                    src={getStorageUrl(item.video)}
                    controls
                    playsInline
                    preload="metadata"
                    style={{
                      width: '100%',
                      // Phone-shot testimonials are portrait; without a cap one clip makes the
                      // admin card taller than the screen.
                      maxHeight: 280,
                      objectFit: 'contain',
                      borderRadius: 8,
                      background: '#0c0c0c',
                      marginBottom: 10,
                    }}
                  />
                )}

                <div className="card-actions-footer">
                  <button type="button" className="btn-card-edit" onClick={() => handleEdit(item)}>
                    <FiEdit2 /> تعديل
                  </button>
                  <button type="button" className="btn-card-delete" onClick={() => handleDelete(item._id)}>
                    <FiTrash2 /> حذف
                  </button>
                </div>
              </div>
            ))}

            {!items.length && <p className="empty-list-msg">لا توجد شهادات مضافة حتى الآن.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTestimonials;
