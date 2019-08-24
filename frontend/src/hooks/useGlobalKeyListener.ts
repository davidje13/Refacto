import useListener from './useListener';

export default function useGlobalKeyListener(
  keyMaps: Record<string, (() => void) | undefined>,
): void {
  useListener(window, 'keydown', (e: KeyboardEvent) => {
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
    const fn = keyMaps[e.key];
    if (fn) {
      e.preventDefault();
      e.stopPropagation();
      if (!e.repeat) {
        fn();
      }
    }
  }, Object.entries(keyMaps).flatMap((o) => o));
}
