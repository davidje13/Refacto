import { useEffect, type RefObject } from 'react';

export const useCursorElement = (
  containerRef: RefObject<HTMLElement>,
  cursorRef: RefObject<HTMLElement | SVGElement>,
  visible: boolean,
) => {
  useEffect(() => {
    const area = containerRef.current;
    const cur = cursorRef.current;
    if (!area || !cur) {
      return;
    }
    let displayed = false;
    const hide = () => {
      cur.style.display = 'none';
      displayed = false;
    };
    hide();
    if (!visible) {
      return;
    }
    const update = (e: PointerEvent) => {
      if (e.isPrimary) {
        cur.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        if (!displayed) {
          cur.style.display = 'block';
          displayed = true;
        }
      }
    };
    const hideUnlessMouse = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') {
        hide();
      }
    };
    area.addEventListener('pointermove', update, { passive: true });
    area.addEventListener('mouseleave', hide);
    area.addEventListener('pointerup', hideUnlessMouse);
    return () => {
      area.removeEventListener('pointermove', update);
      area.removeEventListener('mouseleave', hide);
      area.removeEventListener('pointerup', hideUnlessMouse);
    };
  }, [containerRef, cursorRef, visible]);
};
