import {
  bezier3SVG,
  penTool,
  ptTransform,
  type CubicBezier,
  type Pt,
} from 'curve-ops';
import CursorPen from '../../../../../../resources/cursor-pen.svg?source';
import type { Colour, Curve } from '../../../../../shared/api-entities';
import type { Spec } from '../../../../../api/reducer';
import type { LiveEventDispatch } from '../../../../../hooks/useLiveEvents';
import {
  colourSVG,
  convertCurve,
  convertPoint,
  escapeHTML,
  type Transform,
} from './svg';

export interface Pen {
  type: 'pen';
  name: string;
  colour: Colour;
}

export const pen = (
  setLivePath: (d: string) => void,
  setMyLineUpdate: (update: Spec<Curve> | undefined) => void,
  onAddPath: (colour: Colour, curve: Curve) => void,
  liveEventDispatch: LiveEventDispatch | null,
  liveEventID: string,
  transform: Transform,
  { colour }: Pen,
  begin: Pt,
) => {
  let mutableLine: Curve = [];
  let mutableLive: CubicBezier | null = null;
  let frameDelay = 0;

  function cleanup() {
    mutableLine.length = 0;
    liveEventDispatch?.([liveEventID]);
    setMyLineUpdate(undefined);
    mutableLive = null;
    updateLive();
  }

  const ptT = ptTransform(
    transform.mx,
    0,
    transform.dx,
    0,
    transform.my,
    transform.dy,
  );

  function updateLive() {
    setLivePath(
      mutableLive
        ? bezier3SVG(
            {
              p0: ptT(mutableLive.p0),
              c1: ptT(mutableLive.c1),
              c2: ptT(mutableLive.c2),
              p3: ptT(mutableLive.p3),
            },
            0,
          )
        : '',
    );
    frameDelay = 0;
  }

  const tool = penTool(
    (begin) => {
      mutableLine = [convertPoint(begin, transform)];
      setMyLineUpdate(['push', ...mutableLine]);
    },
    (seg) => {
      mutableLine.push(convertCurve(seg, transform));
      setMyLineUpdate(['push', ...mutableLine]);
      frameDelay = 1; // react takes a frame to re-render - do not update live line until this is done to avoid flicker
    },
    (live) => {
      mutableLive = live;
      if (!frameDelay) {
        updateLive();
      } else if (frameDelay === 1) {
        setTimeout(updateLive, 0);
        frameDelay = 2;
      }
      liveEventDispatch?.nagle(
        () =>
          mutableLive && [
            liveEventID,
            ['push', ...mutableLine, convertCurve(mutableLive, transform)],
            colour,
          ],
        100,
      );
    },
    () => {
      const path = [...mutableLine];
      cleanup();
      onAddPath(colour, path);
    },
    cleanup,
    1,
    100,
    0.3,
    0.5,
  );
  return tool(begin);
};

export const penImage = ({ colour }: Pen, outline: string) =>
  `data:image/svg+xml;base64,${btoa(CursorPen.replaceAll('"currentColor"', `"${escapeHTML(colourSVG(colour))}"`).replaceAll('"black"', `"${escapeHTML(outline)}"`))}`;

export const penCursor = (tool: Pen, outline: string) =>
  `url('${CSS.escape(penImage(tool, outline))}') 3 21,crosshair`;
