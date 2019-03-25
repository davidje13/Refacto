import { useRef, useMemo } from 'react';

export default function useNonce() {
  const ref = useRef();
  return useMemo(() => ({
    next: () => (ref.current = {}), /* eslint-disable-line no-return-assign */
    check: (v) => (ref.current === v),
  }), [ref]);
}
