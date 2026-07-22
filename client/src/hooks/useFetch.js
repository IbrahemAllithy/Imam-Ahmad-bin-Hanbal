import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  getFallbackData,
  mergeLocalBooks,
  mergeLocalLectures,
} from '../utils/fallbackData';

const applyLocalOverlays = (url, res) => {
  if (!res?.data || !Array.isArray(res.data)) return res;

  if (url.startsWith('/lectures')) {
    const merged = mergeLocalLectures(res.data);
    return {
      ...res,
      data: merged,
      pagination: res.pagination
        ? { ...res.pagination, total: merged.length }
        : res.pagination,
    };
  }

  if (url.startsWith('/books')) {
    const merged = mergeLocalBooks(res.data);
    return {
      ...res,
      data: merged,
      pagination: res.pagination
        ? { ...res.pagination, total: merged.length }
        : res.pagination,
    };
  }

  return res;
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
      if (res && res.data) {
        setData(applyLocalOverlays(url, res));
      } else {
        const fallback = getFallbackData(url, params);
        setData(fallback);
      }
    } catch (err) {
      const fallback = getFallbackData(url, params);
      if (fallback) {
        setData(fallback);
      } else {
        setError(err.response?.data?.message || 'حدث خطأ أثناء جلب البيانات');
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
