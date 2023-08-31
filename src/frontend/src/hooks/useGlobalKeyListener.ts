import { useListener } from './useListener';
import { useKeyHandler } from './useKeyHandler';

export function useGlobalKeyListener(
  keyMaps: Record<string, (() => void) | undefined>,
): void {
  const handler = useKeyHandler(keyMaps, { allowRepeat: false });

  useListener(
    window,
    'keydown',
    (e: KeyboardEvent) => {
      const t = e.target as Element;
      if (
        t.tagName === 'INPUT' ||
        t.tagName === 'TEXTAREA' ||
        t.tagName === 'SELECT'
      ) {
        return;
      }
      if (document.body.classList.contains('ReactModal__Body--open')) {
        return;
      }
      handler(e);
    },
    [handler],
  );
}
