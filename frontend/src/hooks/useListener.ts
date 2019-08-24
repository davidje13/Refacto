import { useEffect, useCallback } from 'react';

export default function useListener<E extends Event>(
  target: EventTarget | undefined,
  type: string,
  fn: (e: E) => void,
  inputs: any[],
): void {
  const bound = useCallback(fn, inputs) as EventListener;

  useEffect(() => {
    if (!target) {
      return undefined;
    }
    target.addEventListener(type, bound);
    return (): void => target.removeEventListener(type, bound);
  }, [target, type, bound]);
}
