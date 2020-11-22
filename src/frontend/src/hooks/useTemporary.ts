import { useCallback, useState } from 'react';

type TemporaryT = [
  () => boolean,
  boolean,
];

export default function useTemporary(delay: number): TemporaryT {
  const [state, setState] = useState(false);
  const invoke = useCallback(() => {
    if (state) {
      return false;
    }
    if (delay > 0) {
      setState(true);
      setTimeout(() => setState(false), delay);
    }
    return true;
  }, [state, setState, delay]);

  return [invoke, state];
}
