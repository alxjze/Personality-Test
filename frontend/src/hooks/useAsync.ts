import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/services/api';

/** Loads data on mount (and when deps change) with loading/error state. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fn());
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError('Terjadi kesalahan.', 0, 'unknown'));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void run();
  }, [run]);

  return { data, setData, error, loading, reload: run };
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} — Psikologia Career` : 'Psikologia Career — Kenali Potensimu. Bangun Kariermu.';
  }, [title]);
}
