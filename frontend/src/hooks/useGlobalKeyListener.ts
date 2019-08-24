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
    if (e.repeat) {
      return;
    }
    // TODO: ignore if popup visible
    const fn = keyMaps[e.key];
    if (fn) {
      fn();
    }
  }, Object.entries(keyMaps).flatMap((o) => o));
}
