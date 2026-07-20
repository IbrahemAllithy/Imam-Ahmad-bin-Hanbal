import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useFetch = (url, params = {}, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get(url, { params });
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(params)]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...deps]);

  return { data, loading, error, refetch: fetchData };
};
