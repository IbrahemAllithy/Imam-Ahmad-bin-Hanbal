import { useState, useEffect, useCallback } from 'react';
import { fetchAllLectures } from '../services/lecturesApi';

/**
 * Loads lectures safely against production API constraints
 * (limit ≤ 50, no Arabic-definite category whitelist).
 */
export const useLectures = (params = {}, enabled = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);
  const paramsKey = JSON.stringify(params || {});

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let alive = true;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchAllLectures(JSON.parse(paramsKey), {
          signal: controller.signal,
        });
        if (!alive) return;
        setData(res);
      } catch (err) {
        if (controller.signal.aborted || err?.code === 'ERR_CANCELED') return;
        if (!alive) return;
        setError(err.response?.data?.message || 'حدث خطأ أثناء جلب البيانات');
        setData(null);
      } finally {
        if (alive && !controller.signal.aborted) setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
      controller.abort();
    };
  }, [enabled, paramsKey, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { data, loading, error, refetch };
};
