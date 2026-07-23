import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { getFallbackData } from '../utils/fallbackData';

const LOCAL_CONTENT_KEYS = [
  'custom_admin_lectures_v2',
  'deleted_admin_lecture_ids_v2',
  'custom_admin_books_v2',
  'deleted_admin_book_ids_v2',
];

const clearStaleLocalContent = () => {
  try {
    LOCAL_CONTENT_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignore
  }
};

export const useFetch = (url, params = {}, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get(url, { params });
      if (res && res.data !== undefined) {
        // Successful API = source of truth for public display
        if (url.startsWith('/lectures') || url.startsWith('/books')) {
          clearStaleLocalContent();
        }
        setData(res);
      } else {
        setError('لم يتم العثور على بيانات');
      }
    } catch (err) {
      const status = err.response?.status;
      // Only use demo fallback when the server is unreachable
      const offline = !err.response;
      if (offline) {
        const fallback = getFallbackData(url, params);
        if (fallback) {
          setData(fallback);
          setError(null);
        } else {
          setError(err.response?.data?.message || 'حدث خطأ أثناء جلب البيانات');
        }
      } else {
        setError(
          err.response?.data?.message ||
            (status === 401
              ? 'يجب تسجيل الدخول بحساب إدارة حقيقي'
              : 'حدث خطأ أثناء جلب البيانات')
        );
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(params)]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...deps]);

  return { data, loading, error, refetch: fetchData };
};
