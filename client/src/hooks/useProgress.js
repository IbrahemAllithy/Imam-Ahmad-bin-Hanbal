import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const STORAGE_PREFIX = 'completed_lecture_';

const readLocalCompletedIds = () => {
  const ids = new Set();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX) && localStorage.getItem(key) === 'true') {
        ids.add(key.replace(STORAGE_PREFIX, ''));
      }
    }
  } catch {
    // ignore
  }
  return ids;
};

const clearLocalCompletedKeys = () => {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) keys.push(key);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
};

const hasRealApiSession = () => {
  const token = sessionStorage.getItem('accessToken');
  return token && !token.startsWith('local_') && !token.startsWith('demo_');
};

export const useProgress = () => {
  const { user, isStudent, isAdmin } = useAuth();
  const [completedIds, setCompletedIds] = useState(() => readLocalCompletedIds());
  const [syncing, setSyncing] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const syncedRef = useRef(false);

  const isLoggedIn = Boolean(user && (isStudent || isAdmin) && hasRealApiSession());

  const loadProgress = useCallback(async () => {
    if (!isLoggedIn) {
      setCompletedIds(readLocalCompletedIds());
      return;
    }

    setSyncing(true);
    try {
      const { data } = await api.get('/progress');
      const ids = new Set(data.completedIds || []);
      setCompletedIds(ids);

      if (!syncedRef.current) {
        const localIds = [...readLocalCompletedIds()];
        if (localIds.length) {
          const { data: syncData } = await api.post('/progress/sync', { lectureIds: localIds });
          clearLocalCompletedKeys();
          setCompletedIds(new Set(syncData.completedIds || [...ids, ...localIds]));
        }
        syncedRef.current = true;
      }
    } catch {
      setCompletedIds(readLocalCompletedIds());
    } finally {
      setSyncing(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    syncedRef.current = false;
    loadProgress();
  }, [loadProgress, user?.id]);

  const isCompleted = useCallback(
    (id) => completedIds.has(String(id)),
    [completedIds]
  );

  const progressPercent = useCallback(
    (lessons) => {
      if (!lessons?.length) return 0;
      const done = lessons.filter((l) => completedIds.has(String(l._id))).length;
      return Math.round((done / lessons.length) * 100);
    },
    [completedIds]
  );

  const markComplete = useCallback(
    async (lectureId, quizScore) => {
      const id = String(lectureId);

      if (!isLoggedIn) {
        localStorage.setItem(`${STORAGE_PREFIX}${id}`, 'true');
        setCompletedIds((prev) => new Set([...prev, id]));
        return { needsLogin: true };
      }

      setSyncing(true);
      try {
        const payload = { lectureId: id };
        if (quizScore !== undefined && quizScore !== null) {
          payload.quizScore = quizScore;
        }
        const { data } = await api.post('/progress', payload);
        setCompletedIds((prev) => new Set([...prev, id]));
        if (data.certificate) {
          setCertificate(data.certificate);
        }
        return { success: true, certificate: data.certificate };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || 'تعذر حفظ التقدم',
        };
      } finally {
        setSyncing(false);
      }
    },
    [isLoggedIn]
  );

  const unmarkComplete = useCallback(
    async (lectureId) => {
      const id = String(lectureId);

      if (!isLoggedIn) {
        localStorage.removeItem(`${STORAGE_PREFIX}${id}`);
        setCompletedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        return { success: true };
      }

      setSyncing(true);
      try {
        await api.delete(`/progress/${id}`);
        setCompletedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        return { success: true };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || 'تعذر إلغاء الإكمال',
        };
      } finally {
        setSyncing(false);
      }
    },
    [isLoggedIn]
  );

  return {
    completedIds,
    isCompleted,
    markComplete,
    unmarkComplete,
    syncing,
    progressPercent,
    certificate,
    isLoggedIn,
    refetch: loadProgress,
  };
};

export default useProgress;
