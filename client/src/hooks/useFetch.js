import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

export const useFetch = (url, params = {}, _deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);
  const paramsKey = JSON.stringify(params || {});
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const requestId = ++requestIdRef.current;
    const parsedParams = JSON.parse(paramsKey);

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: res } = await api.get(url, {
          params: parsedParams,
          signal: controller.signal,
        });
        if (requestId !== requestIdRef.current) return;

        if (res && res.data !== undefined) {
          setData(res);
        } else {
          setError('لم يتم العثور على بيانات');
        }
      } catch (err) {
        if (controller.signal.aborted || err?.code === 'ERR_CANCELED') return;
        if (requestId !== requestIdRef.current) return;

        const status = err.response?.status;
        const offline = !err.response;
        setError(
          offline
            ? 'تعذر الاتصال بالخادم — تحقق من اتصال الشبكة'
            : err.response?.data?.message ||
                (status === 401
                  ? 'يجب تسجيل الدخول بحساب إدارة حقيقي'
                  : 'حدث خطأ أثناء جلب البيانات')
        );
        setData(null);
      } finally {
        if (requestId === requestIdRef.current && !controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      controller.abort();
    };
  }, [url, paramsKey, tick]);

  const refetch = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  return { data, loading, error, refetch };
};
