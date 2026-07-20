import { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import api from '../../services/api';
import { formatDate } from '../../utils/helpers';
import Loader from '../../components/ui/Loader';

const AdminContacts = () => {
  const { data, loading, refetch } = useFetch('/contact');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  const contacts = data?.data || [];

  const handleOpen = async (contact) => {
    setSelected(contact);
    if (!contact.read) {
      try {
        await api.patch(`/contact/${contact._id}/read`);
        refetch();
      } catch {
        /* ignore */
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
    setError('');
    try {
      await api.delete(`/contact/${id}`);
      if (selected?._id === id) setSelected(null);
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل حذف الرسالة');
    }
  };

  const unreadCount = contacts.filter((c) => !c.read).length;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>رسائل التواصل</h2>
          <p>
            {contacts.length} رسالة
            {unreadCount > 0 && ` · ${unreadCount} غير مقروءة`}
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? <Loader /> : (
        <div className="contacts-layout">
          <div className="contacts-list">
            {contacts.length ? contacts.map((contact) => (
              <button
                key={contact._id}
                type="button"
                className={`contact-item ${selected?._id === contact._id ? 'active' : ''} ${!contact.read ? 'unread' : ''}`}
                onClick={() => handleOpen(contact)}
              >
                <div className="contact-item-top">
                  <strong>{contact.name}</strong>
                  {!contact.read && <span className="unread-dot" />}
                </div>
                <span className="contact-subject">{contact.subject || 'بدون موضوع'}</span>
                <time>{formatDate(contact.createdAt)}</time>
              </button>
            )) : (
              <p className="empty-state">لا توجد رسائل بعد</p>
            )}
          </div>

          <div className="contact-detail">
            {selected ? (
              <>
                <div className="contact-detail-header">
                  <div>
                    <h3>{selected.subject || 'بدون موضوع'}</h3>
                    <p>{selected.name} · {selected.email}</p>
                    <time>{formatDate(selected.createdAt)}</time>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline danger btn-sm"
                    onClick={() => handleDelete(selected._id)}
                  >
                    حذف
                  </button>
                </div>
                <div className="contact-message">{selected.message}</div>
                <a href={`mailto:${selected.email}`} className="btn btn-primary">
                  الرد عبر البريد
                </a>
              </>
            ) : (
              <div className="contact-detail-empty">
                <p>اختر رسالة لعرض تفاصيلها</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
