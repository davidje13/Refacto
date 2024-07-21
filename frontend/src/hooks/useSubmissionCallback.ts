import { useState, useRef, useEffect, SyntheticEvent } from 'react';
import { useEvent } from './useEvent';

interface StateT {
  sending: boolean;
  error?: string;
}

type SubmissionT = [(e: SyntheticEvent) => void, boolean, string | undefined];

export function useSubmissionCallback(
  fn: () => Promise<void> | void,
): SubmissionT {
  const [state, setState] = useState<StateT>({ sending: false });
  const internalState = useRef({ sending: false, mounted: false });

  useEffect(() => {
    internalState.current.mounted = true;
    return () => {
      internalState.current.mounted = false;
    };
  }, []);

  const handleSubmit = useEvent(async (e: SyntheticEvent) => {
    e.preventDefault();

    if (internalState.current.sending || !internalState.current.mounted) {
      return;
    }

    internalState.current.sending = true;
    try {
      setState({ sending: true });

      await fn();

      if (internalState.current.mounted) {
        setState({ sending: false });
      }
    } catch (err) {
      if (internalState.current.mounted) {
        if (err instanceof Error) {
          setState({ sending: false, error: err.message });
        } else {
          setState({ sending: false, error: String(err) });
        }
      }
    } finally {
      internalState.current.sending = false;
    }
  });

  return [handleSubmit, state.sending, state.error];
}
