import { useRef, useMemo } from 'react';

type NonceT = object; /* eslint-disable-line @typescript-eslint/ban-types */

interface NonceRef {
  next(): NonceT;
  check(nonce: NonceT): boolean;
}

export default function useNonce(): NonceRef {
  const ref = useRef<NonceT>();
  return useMemo(() => ({
    next: (): NonceT => (ref.current = {}), /* eslint-disable-line no-return-assign */
    check: (v: NonceT): boolean => (ref.current === v),
  }), [ref]);
}
