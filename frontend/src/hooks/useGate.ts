import { useState } from 'react';
import { useEvent } from './useEvent';

/**
 * Gates actions until they are accepted. Once any action has been accepted,
 * all subsequent actions will be accepted automatically.
 */
export const useGate = (
  condition: () => boolean,
): {
  useGated: <Fn extends (...args: any) => void>(
    fn: Fn | undefined,
  ) => ((...args: Parameters<Fn>) => void) | undefined;
  pending: boolean;
  accept: () => void;
  reject: () => void;
} => {
  const [accepted, setAccepted] = useState(false);
  const [pending, setPending] = useState<(() => void) | null>(null);
  const accept = useEvent(() => {
    setAccepted(true);
    pending?.();
    setPending(null);
  });
  const reject = useEvent(() => setPending(null));

  return {
    useGated: <Fn extends (...args: any) => void>(fn: Fn | undefined) => {
      const handler = useEvent((...args: Parameters<Fn>) => {
        if (!fn) {
          return undefined;
        }
        if (accepted) {
          return fn(...args);
        }
        if (condition()) {
          setAccepted(true);
          return fn(...args);
        }
        setPending(() => () => fn(...args));
        return undefined;
      });
      return fn ? handler : undefined;
    },
    pending: pending !== null,
    accept,
    reject,
  };
};
