import { useState, useCallback, useRef, useEffect } from 'react';

interface StateT {
  sending: boolean;
  error?: string;
}

type SubmissionT = [
  (e: React.SyntheticEvent) => void,
  boolean,
  string | undefined,
];

export function useSubmissionCallback(
  fn: () => Promise<void> | void,
  deps: React.DependencyList,
): SubmissionT {
  const [state, setState] = useState<StateT>({ sending: false });
  const sendingRef = useRef(false);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return (): void => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = useCallback(
    async (e: React.SyntheticEvent): Promise<void> => {
      e.preventDefault();

      if (sendingRef.current) {
        return;
      }

      try {
        sendingRef.current = true;
        setState({ sending: true });

        await fn();

        sendingRef.current = false;
        if (isMounted.current) {
          setState({ sending: false });
        }
      } catch (err) {
        sendingRef.current = false;
        if (isMounted.current) {
          if (err instanceof Error) {
            setState({ sending: false, error: err.message });
          } else {
            setState({ sending: false, error: String(err) });
          }
        }
      }
    },
    [sendingRef, setState, isMounted, fn, ...deps],
  );

  return [handleSubmit, state.sending, state.error];
}
