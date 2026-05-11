import { useState, useEffect, useContext, useCallback } from 'react';
import { CacheContext } from '../context/CacheContext';

export function useFetch(cacheKey, fetcher) {
  const cache = useContext(CacheContext);
  const [data, setDataState] = useState(() => cache.get(cacheKey));
  const [loading, setLoading] = useState(!cache.get(cacheKey));
  const [error, setError] = useState(null);

  const load = useCallback(
    async (force = false) => {
      if (!force) {
        const cached = cache.get(cacheKey);
        if (cached !== undefined) {
          setDataState(cached);
          setLoading(false);
          return;
        }
      }
      setLoading(true);
      setError(null);
      try {
        const result = await fetcher();
        cache.set(cacheKey, result);
        setDataState(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [cacheKey, cache]
  );

  useEffect(() => {
    load(false);
  }, [cacheKey]);

  const setData = useCallback(
    (updater) => {
      setDataState((prev) => {
        const next =
          typeof updater === 'function' ? updater(prev) : updater;
        cache.set(cacheKey, next);
        return next;
      });
    },
    [cache, cacheKey]
  );

  return { data, loading, error, refetch: () => load(true), setData };
}
