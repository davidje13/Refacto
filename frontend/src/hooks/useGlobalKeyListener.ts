import { useEffect } from 'react';
import { useEvent } from './useEvent';
import { fullKeyName } from './useKeyHandler';

export function useGlobalKeyListener(
  keyMaps: Record<string, (() => void) | undefined>,
) {
  const handler = useEvent((e: KeyboardEvent) => {
    const t = e.target as Element;
    if (
      t.tagName === 'INPUT' ||
      t.tagName === 'TEXTAREA' ||
      t.tagName === 'SELECT' ||
      document.body.classList.contains('ReactModal__Body--open')
    ) {
      return;
    }
    const fn = keyMaps[fullKeyName(e)];
    if (fn) {
      e.preventDefault();
      e.stopPropagation();
      if (!e.repeat) {
        fn();
      }
    }
  });

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}
