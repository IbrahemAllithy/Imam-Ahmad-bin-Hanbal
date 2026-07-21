import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { getFallbackData } from '../utils/fallbackData';

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
        setData(res);
      } else {
        const fallback = getFallbackData(url, params);
        setData(fallback);
      }
    } catch (err) {
      // If API fails or is offline, use rich fallback data gracefully
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
