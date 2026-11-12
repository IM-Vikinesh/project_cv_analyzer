import { useCallback, useEffect, useRef, useState } from 'react';

export const isCanceledRequest = (error) =>
  error?.code === 'ERR_CANCELED' ||
  error?.name === 'CanceledError' ||
  error?.name === 'AbortError';

const getErrorMessage = (error) =>
  error?.response?.data?.error || error?.message || 'Something went wrong';

export default function useAsyncData(fetcher, deps = []) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const requestId = useRef(0);
  const controllerRef = useRef(null);
  const hasDataRef = useRef(false);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const run = useCallback(async () => {
    const id = ++requestId.current;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState((previous) => ({
      status: hasDataRef.current ? 'refreshing' : 'loading',
      data: previous.data,
      error: null,
    }));

    try {
      const data = await fetcherRef.current(controller.signal);
      if (id !== requestId.current) return;
      hasDataRef.current = true;
      setState({ status: 'success', data, error: null });
    } catch (error) {
      if (id !== requestId.current || isCanceledRequest(error)) return;
      setState((previous) => ({
        status: 'error',
        data: previous.data,
        error: getErrorMessage(error),
      }));
    }
  }, []);

  useEffect(() => {
    run();
    return () => {
      requestId.current += 1;
      controllerRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, ...deps]);

  return { ...state, retry: run };
}
