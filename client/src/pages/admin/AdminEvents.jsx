import { useState, useEffect } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getStorageUrl } from '../../services/api';
import api from '../../services/api';
import Loader from '../../components/ui/Loader';
import { FiEdit2, FiTrash2, FiPlus, FiCheck, FiCalendar, FiMove } from 'react-icons/fi';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './Admin.css';

const emptyForm = { title: '', description: '', eventDate: '' };

const toDateInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const EventCard = ({ item, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item._id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="admin-lecture-card">
      {item.coverImage && (
        <div
          style={{
            width: '100%',
            aspectRatio: '16/9',
            borderRadius: 10,
            overflow: 'hidden',
            marginBottom: 10,
            background: 'oklch(0.94 0.01 255)',
          }}
        >
          <img
            src={getStorageUrl(item.coverImage)}
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      <div className="card-badge-row">
        {item.eventDate ? (
          <span className="card-cat-badge">
            <FiCalendar /> {toDateInput(item.eventDate)}
          </span>
        ) : (
          <span />
        )}
        <button type="button" className="drag-handle" {...attributes} {...listeners} aria-label="اسحب لإعادة الترتيب">
          <FiMove />
        </button>
      </div>
      <h4 className="card-lecture-title">{item.title}</h4>

      <div className="card-actions-footer">
        <button type="button" className="btn-card-edit" onClick={() => onEdit(item)}>
          <FiEdit2 /> تعديل
        </button>
        <button type="button" className="btn-card-delete" onClick={() => onDelete(item._id)}>
          <FiTrash2 /> حذف
        </button>
      </div>
    </div>
  );
};

const AdminEvents = () => {
  const { data, loading, error: fetchError, refetch } = useFetch('/events');
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [events, setEvents] = useState([]);
  useEffect(() => {
    setEvents(data?.data || []);
  }, [data]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = events.findIndex((e) => e._id === active.id);
    const newIndex = events.findIndex((e) => e._id === over.id);
    const reordered = arrayMove(events, oldIndex, newIndex);
    setEvents(reordered);
    try {
      await api.put('/events/reorder', { ids: reordered.map((e) => e._id) });
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل حفظ ترتيب الفعاليات');
      setEvents(data?.data || []);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setCoverFile(null);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title.trim()) {
      setError('عنوان الفعالية مطلوب');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description || '');
      formData.append('eventDate', form.eventDate);
      if (coverFile) formData.append('coverImage', coverFile);

      if (editId) {
        await api.put(`/events/${editId}`, formData);
        setSuccess('تم تحديث الفعالية ✓');
      } else {
        await api.post('/events', formData);
        setSuccess('تم إضافة الفعالية ✓');
      }
      resetForm();
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل الحفظ على السيرفر');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (event) => {
    setEditId(event._id);
    setForm({
      title: event.title || '',
      description: event.description || '',
      eventDate: toDateInput(event.eventDate),
    });
    setCoverFile(null);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الفعالية؟')) return;
    setError('');
    try {
      await api.delete(`/events/${id}`);
      setSuccess('تم حذف الفعالية ✓');
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل الحذف على السيرفر');
    }
  };

  return (
    <div className="admin-books-page">
      <div className="admin-page-header">
        <div>
          <h2>الفعاليات</h2>
          <p>الفعاليات اللي تظهر في صفحة "فعاليات" على الموقع</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-card">
        <h3 className="form-card-title">
          {editId ? <><FiEdit2 /> تعديل الفعالية الحالية</> : <><FiPlus /> إضافة فعالية جديدة</>}
        </h3>

        {(error || fetchError) && <div className="alert alert-error">{error || fetchError}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>عنوان الفعالية *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="مثال: لقاء مفتوح مع الشيخ"
            />
          </div>

          <div className="form-group">
            <label>تاريخ الفعالية (اختياري)</label>
            <input
              type="date"
              value={form.eventDate}
              onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            />
            <small style={{ color: 'var(--text-muted)' }}>
              اتركه فارغًا لصور المعرض التي لا تتبع تاريخًا محددًا
            </small>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>وصف الفعالية</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="تفاصيل الفعالية..."
          />
        </div>

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>صورة الفعالية (اختياري)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          />
          {coverFile && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              الملف المختار: {coverFile.name}
            </span>
          )}
        </div>

        <div className="form-actions-bar">
          <button type="submit" className="btn-admin-submit" disabled={submitting}>
            <FiCheck /> {editId ? 'حفظ التعديلات' : 'إضافة الفعالية'}
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
          <h3>الفعاليات ({events.length}) — اسحب لإعادة الترتيب</h3>
        </div>

        {loading && !events.length ? (
          <Loader />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={events.map((e) => e._id)} strategy={verticalListSortingStrategy}>
              <div className="admin-cards-grid">
                {events.map((item) => (
                  <EventCard key={item._id} item={item} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
                {!events.length && <p className="empty-list-msg">لا توجد فعاليات مضافة حتى الآن.</p>}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default AdminEvents;
