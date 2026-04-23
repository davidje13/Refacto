import type { CubicBezier, Point2D } from 'curve-ops';
import type {
  Colour,
  CurveCubicBezier,
  CurveMove,
} from '../../../../../shared/api-entities';

export interface Transform {
  mx: number;
  my: number;
  dx: number;
  dy: number;
}

export const colourSVG = (c: Colour) =>
  `hsl(${Math.round(c.h ?? 0)}deg,${Math.round((c.s ?? 0.6) * 100)}%,${Math.round((c.l ?? 0.55) * 100)}%)`;

export const convertPoint = (pt: Point2D, t: Transform): CurveMove => [
  Math.round(pt.x * t.mx + t.dx),
  Math.round(pt.y * t.my + t.dy),
];

export const convertCurve = (
  curve: CubicBezier,
  t: Transform,
): CurveCubicBezier => [
  ...convertPoint(curve.c1, t),
  ...convertPoint(curve.c2, t),
  ...convertPoint(curve.p3, t),
];

export const escapeHTML = (v: string) =>
  v
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
