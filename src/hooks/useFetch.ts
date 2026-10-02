import { useCallback, useEffect, useState } from 'react';

export type FetchState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  status: number | null;
  refetch: () => void;
};

type RequestState<T> = Omit<FetchState<T>, 'refetch'>;

class HttpError extends Error {
  constructor(public status: number) {
    super(`Ошибка ${status}`);
  }
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

export function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<RequestState<T>>({
    data: null,
    isLoading: true,
    error: null,
    status: null,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setState({ data: null, isLoading: true, error: null, status: null });

    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new HttpError(response.status);
        }
        const data: T = await response.json();
        setState({ data, isLoading: false, error: null, status: response.status });
      } catch (err) {
        if (isAbortError(err) || controller.signal.aborted) return;

        setState({
          data: null,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Неизвестная ошибка',
          status: err instanceof HttpError ? err.status : null,
        });
      }
    }

    load();

    return () => controller.abort();
  }, [url, attempt]);

  const refetch = useCallback(() => setAttempt(n => n + 1), []);

  return { ...state, refetch };
}
