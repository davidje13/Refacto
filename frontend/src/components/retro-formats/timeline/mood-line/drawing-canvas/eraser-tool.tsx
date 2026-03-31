import {
  bezier3Bounds,
  bezier3FromPts,
  cutBezier3Circle,
  cutBezier3Rect,
  intersectBezier3CircleFn,
  isOverlapAABox,
  isOverlapAABoxCircleR2,
  movementThrottle,
  ptDist2,
  rectBounds,
  rectFromLine,
  SingleLinkedList,
  type AxisAlignedBox,
  type Circle,
  type CircleIntersectionFn,
  type CubicBezier,
  type Pt,
} from 'curve-ops';
import {
  simplifySplice,
  type SpliceSpec,
  type SpliceStep,
} from 'json-immutability-helper';
import { memo, type MutableRefObject } from 'react';
import CursorEraser from '../../../../../../resources/cursor-eraser.svg?source';
import type { Curve, CurveElement } from '../../../../../shared/api-entities';
import type { Spec } from '../../../../../api/reducer';
import type { LiveEventDispatch } from '../../../../../hooks/useLiveEvents';
import { convertCurve, convertPoint, escapeHTML, type Transform } from './svg';

export interface Eraser {
  type: 'eraser';
  name: string;
  radius: number;
}

export const eraser = (
  setMyLineUpdate: (update: Spec<Curve> | undefined) => void,
  onUpdatePath: (spec: Spec<Curve>) => void,
  liveEventDispatch: LiveEventDispatch | null,
  liveEventID: string,
  transform: Transform,
  { radius }: Eraser,
  path: Curve,
  begin: Pt,
) => {
  const rr = radius * radius;
  const segments = prepareSegments(path, transform);

  let updates: SpliceSpec<CurveElement> = ['splice'];

  function cleanup() {
    liveEventDispatch?.([liveEventID]);
    setMyLineUpdate(undefined);
  }

  function doErase(from: Pt, to: Pt, done: boolean) {
    const endCap: Circle = { c: to, r: radius };
    const line =
      ptDist2(from, to) > rr * 0.1 * 0.1
        ? rectFromLine({ p0: from, p1: to }, radius * 2)
        : null;
    const lineBounds = line ? rectBounds(line) : null;

    const curUpdates: SpliceStep<CurveElement>[] = [];
    let p = 0;
    segments.forEach((seg, { next, replace }) => {
      let parts: (CubicBezier & { inside?: boolean })[] = [seg._curve];
      if (isOverlapAABoxCircleR2(seg._bounds, endCap.c, rr)) {
        seg._circFn ??= intersectBezier3CircleFn(seg._curve);
        parts = cutBezier3Circle(seg._curve, endCap, seg._circFn);
      }
      if (lineBounds && isOverlapAABox(seg._bounds, lineBounds)) {
        parts = parts.flatMap((c) =>
          c.inside ? [c] : cutBezier3Rect(c, line!),
        );
      }
      if (parts.length === 1 && !parts[0]!.inside) {
        // nothing to change
        p += seg._moveCount + 1;
        return;
      }
      let gap = seg._moveCount > 0;
      const replacement: IntersectionSegment[] = [];
      const replacementCurve: CurveElement[] = [];
      for (const part of parts) {
        if (!part.inside) {
          replacement.push({
            _moveCount: gap ? 1 : 0,
            _curve: part,
            _bounds: bezier3Bounds(part),
            _circFn: null,
          });
          if (gap) {
            replacementCurve.push(convertPoint(part.p0, transform));
          }
          replacementCurve.push(convertCurve(part, transform));
          gap = false;
        } else {
          gap = true;
        }
      }
      replace(...replacement);
      const newSegmentPartCount = replacementCurve.length;
      if (gap && next && !next._moveCount) {
        replacementCurve.push(convertPoint(seg._curve.p3, transform));
        next._moveCount = 1;
      }
      curUpdates.push([p, seg._moveCount + 1, ...replacementCurve]);
      p += newSegmentPartCount;
    });
    if (curUpdates.length) {
      updates = simplifySplice(updates, curUpdates);
      setMyLineUpdate(updates);
      liveEventDispatch?.nagle(() => [liveEventID, updates], 100);
    }
    if (done) {
      if (updates.length > 1) {
        onUpdatePath(updates);
      }
      cleanup();
    }
  }

  return movementThrottle(null, doErase, cleanup, 1, 200)(begin);
};

export const eraserImage = (_: Eraser, outline: string) =>
  `data:image/svg+xml;base64,${btoa(CursorEraser.replaceAll('"black"', `"${escapeHTML(outline)}"`))}`;
export const eraserCursor = (tool: Eraser, outline: string) =>
  `url('${CSS.escape(eraserImage(tool, outline))}') 4 19,crosshair`;

interface EraserCursorAugProps {
  rad: number;
  entityRef: MutableRefObject<SVGSVGElement | null>;
}

export const EraserCursorAug = memo(
  ({ rad, entityRef }: EraserCursorAugProps) => {
    const r = Math.ceil(rad) + 1;

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox={`${-r} ${-r} ${r * 2} ${r * 2}`}
        width={r * 2}
        height={r * 2}
        style={{ left: -r, top: -r }}
        className="cursor-aug eraser"
        ref={entityRef}
      >
        <circle r={rad} strokeDasharray={(Math.PI * 2 * rad) / 24} />
      </svg>
    );
  },
);

interface IntersectionSegment {
  _moveCount: number;
  _curve: CubicBezier;
  _bounds: AxisAlignedBox;
  _circFn: CircleIntersectionFn | null;
}

function prepareSegments(curve: Curve, { mx, my, dx, dy }: Transform) {
  const imx = 1 / mx;
  const imy = 1 / my;
  const idx = -dx * imx;
  const idy = -dy * imy;
  const segments = new SingleLinkedList<IntersectionSegment>();
  let prev: Pt = { x: 0, y: 0 };
  let moveCount = 0;
  for (const part of curve) {
    if (part.length === 2) {
      prev = { x: part[0] * imx + idx, y: part[1] * imy + idy };
      ++moveCount;
    } else {
      const c1 = { x: part[0] * imx + idx, y: part[1] * imy + idy };
      const c2 = { x: part[2] * imx + idx, y: part[3] * imy + idy };
      const p3 = { x: part[4] * imx + idx, y: part[5] * imy + idy };
      const seg = bezier3FromPts(prev, c1, c2, p3);
      segments.push({
        _moveCount: moveCount,
        _curve: seg,
        _bounds: bezier3Bounds(seg),
        _circFn: null,
      });
      prev = p3;
      moveCount = 0;
    }
  }
  return segments;
}
