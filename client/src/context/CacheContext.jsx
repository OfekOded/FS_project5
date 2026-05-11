import { createContext, useRef, useCallback } from 'react';

export const CacheContext = createContext(null);

export function CacheProvider({ children }) {
  const cacheRef = useRef(new Map());

  const get = useCallback((key) => {
    return cacheRef.current.get(key);
  }, []);

  const set = useCallback((key, value) => {
    cacheRef.current.set(key, value);
  }, []);

  const invalidate = useCallback((keyPrefix) => {

    const keys = Array.from(cacheRef.current.keys());
    keys.forEach((k) => {
      if (k.startsWith(keyPrefix)) cacheRef.current.delete(k);
    });
  }, []);

  const clear = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return (
    <CacheContext.Provider value={{ get, set, invalidate, clear }}>
      {children}
    </CacheContext.Provider>
  );
}
