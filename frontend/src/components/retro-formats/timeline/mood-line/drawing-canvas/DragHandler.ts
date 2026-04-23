import type { Point2D } from 'curve-ops';

export interface MovementHandler {
  move: (pt: Point2D, end: boolean) => void;
  cancel?: () => void;
}

export class DragHandler {
  declare private _state: { id: number; target: HTMLElement } | undefined;
  declare private _handler: MovementHandler | undefined;

  constructor(
    private readonly pointRegion: HTMLElement,
    private readonly onBegin: (pt: Point2D) => MovementHandler | null,
  ) {}

  detach(noCancel = false) {
    if (!this._state) {
      return;
    }
    const o = this._state.target;
    o.releasePointerCapture(this._state.id);
    o.ownerDocument.documentElement.style.cursor = '';
    o.removeEventListener('pointerup', this.stop);
    o.removeEventListener('pointermove', this.move);
    o.removeEventListener('pointercancel', this.cancel);
    this._state = undefined;
    if (!noCancel) {
      this._handler?.cancel?.();
    }
    this._handler = undefined;
  }

  toPt(e: PointerEvent) {
    const p = this.pointRegion;
    const b = p.getBoundingClientRect();
    return {
      x: e.clientX - b.left - p.clientLeft,
      y: e.clientY - b.top - p.clientTop,
    };
  }

  begin = (e: PointerEvent) => {
    if (this._state || !e.isPrimary || e.button !== 0) {
      return;
    }
    const id = e.pointerId;
    const o = e.currentTarget as HTMLElement;

    this._state = { id, target: o };

    o.addEventListener('pointerup', this.stop);
    o.addEventListener('pointermove', this.move);
    o.addEventListener('pointercancel', this.cancel);
    o.setPointerCapture(id);
    e.preventDefault();

    // work around Safari not locking cursor when using setPointerCapture
    o.ownerDocument.documentElement.style.cursor = o.style.cursor;

    this._handler = this.onBegin(this.toPt(e)) ?? undefined;
    if (!this._handler) {
      this.detach();
    }
  };

  move = (e: PointerEvent) => {
    if (e.pointerId === this._state?.id) {
      this._handler?.move(this.toPt(e), false);
    }
  };

  stop = (e: PointerEvent) => {
    if (e.pointerId === this._state?.id) {
      const handler = this._handler;
      this.detach(true);
      handler?.move(this.toPt(e), true);
    }
  };

  cancel = (e: PointerEvent) => {
    if (e.pointerId === this._state?.id) {
      this.detach();
    }
  };
}
