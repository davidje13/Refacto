import { useEffect } from 'react';

export function useListener<E extends Event>(
  target: EventTarget | undefined,
  type: string,
  fn: (e: E) => void,
  deps?: React.DependencyList,
): void {
  useEffect(() => {
    if (!target) {
      return undefined;
    }
    const func = fn as EventListener;
    target.addEventListener(type, func);
    return (): void => target.removeEventListener(type, func);
  }, [target, type, ...(deps || [fn])]);
}
