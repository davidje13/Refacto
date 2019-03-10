import { useRef, useEffect } from 'react';

export default function useBoxed(value) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
