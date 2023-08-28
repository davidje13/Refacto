import { useRef, useMemo } from 'react';

type NonceT = object;

interface NonceRef {
  next(): NonceT;
  check(nonce: NonceT): boolean;
}

export default function useNonce(): NonceRef {
  const ref = useRef<NonceT>();
  return useMemo(() => ({
    next: (): NonceT => (ref.current = {}),
    check: (v: NonceT): boolean => (ref.current === v),
  }), [ref]);
}
