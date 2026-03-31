import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FunctionComponent,
  type ReactNode,
} from 'react';
import type { Colour, Curve } from '../../../../../shared/api-entities';
import { context, type Spec } from '../../../../../api/reducer';
import { classNames } from '../../../../../helpers/classNames';
import {
  useLiveEventDispatch,
  useLiveEvents,
} from '../../../../../hooks/useLiveEvents';
import { useEvent } from '../../../../../hooks/useEvent';
import { useRefed } from '../../../../../hooks/useRefed';
import { useMediaQuery } from '../../../../../hooks/env/useMediaQuery';
import { useCursorElement } from '../../../../../hooks/useCursorElement';
import { DragHandler } from './DragHandler';
import { pen, penCursor, type Pen } from './pen-tool';
import {
  eraser,
  eraserCursor,
  EraserCursorAug,
  type Eraser,
} from './eraser-tool';
import { colourSVG, type Transform } from './svg';
import './DrawingCanvas.css';

export interface Path {
  id: string;
  colour: Colour;
  curve: Curve;
}

export type Tool = Pen | Eraser;

interface DrawingCanvasProps {
  className?: string;
  paths: Path[];
  livePathID: string;
  onAddPath?: ((colour: Colour, curve: Curve) => void) | undefined;
  onUpdatePath?: ((spec: Spec<Curve>) => void) | undefined;
  activeTool: Tool | null;
  viewbox: [number, number, number, number];
  liveEventPrefix: string;
  children?: ReactNode;
}

const NOOP = () => {};

export const DrawingCanvas: FunctionComponent<DrawingCanvasProps> = ({
  className,
  paths,
  livePathID,
  onAddPath = NOOP,
  onUpdatePath = NOOP,
  activeTool,
  viewbox,
  liveEventPrefix,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<SVGSVGElement>(null);
  const cursorAugRef = useRef<SVGSVGElement>(null);
  const livePathRef = useRef<SVGPathElement>(null);
  const viewboxRef = useRefed(viewbox);

  const [myLineUpdate, setMyLineUpdate] = useState<Spec<Curve> | undefined>();
  const remoteLineUpdates = useLiveEvents(liveEventPrefix);
  const liveEventDispatch = useLiveEventDispatch();

  const pathsMap = new Map<
    string,
    { curve: Curve; colour: Colour; updates?: Spec<Curve> | undefined }
  >();
  for (const path of paths) {
    pathsMap.set(path.id, path);
  }

  for (const [key, delta] of remoteLineUpdates) {
    if (delta[0]) {
      const id = key.substring(liveEventPrefix.length);
      const base = pathsMap.get(id);
      pathsMap.set(id, {
        curve: base?.curve ?? EMPTY,
        colour: (delta[1] as Colour) ?? base?.colour ?? {},
        updates: delta[0] as Spec<Curve>,
      });
    }
  }
  const myBase = pathsMap.get(livePathID);
  pathsMap.set(livePathID, {
    curve: myBase?.curve ?? EMPTY,
    colour:
      myBase?.colour ?? (activeTool?.type === 'pen' ? activeTool.colour : {}),
    updates: myLineUpdate,
  });

  const stableOnAddPath = useEvent(onAddPath);
  const stableOnUpdatePath = useEvent(onUpdatePath);
  const activeToolRef = useRefed(activeTool);
  const activePathRef = useRefed(pathsMap.get(livePathID));

  const liveEventID = liveEventPrefix + livePathID;
  useEffect(() => {
    const container = containerRef.current;
    const area = areaRef.current;
    if (!container || !area) {
      return;
    }

    const drawPointer = new DragHandler(container, (pt) => {
      // snapshot transformation when user begins, so that they are
      // not thrown around if the scale changes while they are drawing
      const bHold = container.getBoundingClientRect();
      const bArea = area.getBoundingClientRect();
      const mx = viewboxRef.current[2] / area.clientWidth;
      const my = viewboxRef.current[3] / area.clientHeight;
      const transform: Transform = {
        mx,
        my,
        dx: viewboxRef.current[0] - (bArea.left - bHold.left) * mx,
        dy: viewboxRef.current[1] - (bArea.top - bHold.top) * my,
      };
      switch (activeToolRef.current?.type) {
        case 'pen':
          return pen(
            // Setting the 'd' attribute directly avoids a react round-trip, but is still a fairly
            // slow way to render the live path. This typically has ~2 frames of latency.
            // It's possible to go faster with an OffscreenCanvas (~1 frame of latency), and even
            // faster with desynchronized:true (on supporting browsers), but those introduce timing
            // issues with the SVG-rendered segments. Since this isn't a drawing tool, 2 frames of
            // latency is good enough.
            (path) => livePathRef.current?.setAttribute('d', path),
            setMyLineUpdate,
            stableOnAddPath,
            liveEventDispatch,
            liveEventID,
            transform,
            activeToolRef.current,
            pt,
          );
        case 'eraser':
          return eraser(
            setMyLineUpdate,
            stableOnUpdatePath,
            liveEventDispatch,
            liveEventID,
            transform,
            activeToolRef.current,
            activePathRef.current
              ? applyUpdates(
                  activePathRef.current.curve,
                  activePathRef.current.updates,
                )
              : [],
            pt,
          );
        default:
          return null;
      }
    });
    container.addEventListener('pointerdown', drawPointer.begin);

    // disable force touch in Safari
    container.addEventListener('webkitmouseforcewillbegin', prevent, {
      passive: false,
    });

    return () => {
      drawPointer.detach();
      container.removeEventListener('pointerdown', drawPointer.begin);
      container.removeEventListener('webkitmouseforcewillbegin', prevent);
    };
  }, [liveEventDispatch, liveEventID]);

  const darkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const cursor = useMemo(() => {
    const outline = darkMode ? '#333333' : '#000000';
    switch (activeTool?.type) {
      case 'pen':
        return penCursor(activeTool, outline);
      case 'eraser':
        return eraserCursor(activeTool, outline);
      default:
        return 'default';
    }
  }, [activeTool, darkMode]);

  useCursorElement(containerRef, cursorAugRef, activeTool?.type === 'eraser');

  const allCurves: ReactNode[] = [];
  for (const [id, { curve, colour, updates }] of pathsMap) {
    allCurves.push(
      <DrawnLine
        key={id}
        col={colourSVG(colour)}
        curve={curve}
        updates={updates}
      />,
    );
  }

  return (
    <div
      className={classNames('drawing-canvas', className, {
        live: activeTool !== null,
      })}
      style={{ cursor }}
      ref={containerRef}
    >
      <div className="region">
        {children}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          viewBox={viewbox.join(' ')}
          preserveAspectRatio="none"
          className="drawing"
          ref={areaRef}
        >
          {allCurves}
          {activeTool?.type === 'pen' ? (
            <path
              ref={livePathRef}
              className="line"
              color={colourSVG(activeTool.colour)}
            />
          ) : null}
        </svg>
      </div>
      <EraserCursorAug
        entityRef={cursorAugRef}
        rad={activeTool?.type === 'eraser' ? activeTool.radius : 0}
      />
    </div>
  );
};

const prevent = (e: Event) => e.preventDefault();
const EMPTY: never[] = [];

interface DrawnLineProps {
  col: string;
  curve: Curve;
  updates?: Spec<Curve> | undefined;
}

const DrawnLine = memo(({ col, curve, updates }: DrawnLineProps) => {
  const paths = useMemo(() => {
    const updatedCurve = applyUpdates(curve, updates);
    let r: string[] = [];
    let cur = '';
    let hasLine = false;
    for (const part of updatedCurve) {
      if (part.length === 2) {
        if (hasLine) {
          r.push(cur);
        }
        cur = 'M' + part.join(' ');
        hasLine = false;
      } else {
        cur += 'C' + part.join(' ');
        hasLine = true;
      }
    }
    if (hasLine) {
      r.push(cur);
    }
    return r;
  }, [curve, updates]);
  return (
    <>
      {paths.map((path, i) => (
        <path key={i} className="line" color={col} d={path} />
      ))}
    </>
  );
});

function applyUpdates(curve: Curve, updates: Spec<Curve> | undefined): Curve {
  if (updates) {
    try {
      return context.update(curve, updates);
    } catch {
      // ignore errors and discard update - it comes from other users so could be messed up in arbitrary ways
    }
  }
  return curve;
}
