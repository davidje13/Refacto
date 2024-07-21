import { useEffect } from 'react';

export const useListener = <E extends Event>(
  target: EventTarget | undefined,
  type: string,
  fn: (e: E) => void,
) =>
  useEffect(() => {
    if (!target) {
      return;
    }
    target.addEventListener(type, fn as EventListener);
    return () => target.removeEventListener(type, fn as EventListener);
  }, [target, type, fn]);
