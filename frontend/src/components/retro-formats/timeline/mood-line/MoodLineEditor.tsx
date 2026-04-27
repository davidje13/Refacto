import {
  useState,
  type CSSProperties,
  type FunctionComponent,
  type ReactNode,
} from 'react';
import type { Colour, Curve, RetroItem } from '@refacto/shared/api-entities';
import type { Spec } from '../../../../api/reducer';
import {
  DrawingCanvas,
  type Path,
  type Tool,
} from './drawing-canvas/DrawingCanvas';
import { Toolbox } from './drawing-canvas/Toolbox';
import { AddLesson } from '../lessons/AddLesson';
import './MoodLineEditor.css';

export const MoodLineEditor: FunctionComponent<{
  myID: string;
  events: RetroItem[];
  rangeStart: number;
  rangeEnd: number;
  group?: string | undefined;
  paths: Path[];
  tools: Tool[];
  onAddPath?: ((colour: Colour, curve: Curve) => void) | undefined;
  onUpdatePath?: ((spec: Spec<Curve>) => void) | undefined;
  onAddLesson?:
    | ((group: string | undefined, itemParts: Partial<RetroItem>) => void)
    | undefined;
}> = ({
  myID,
  events,
  rangeStart,
  rangeEnd,
  group,
  paths,
  tools,
  onAddPath,
  onUpdatePath,
  onAddLesson,
}) => {
  const [tool, setTool] = useState(tools[0] ?? null);
  const xNotches: ReactNode[] = [];
  const day0 = Math.floor(rangeStart / DAY);
  const dayN = Math.floor(rangeEnd / DAY);
  const dayStep = dayN - day0 > 90 ? 7 : 1;
  const posStyle = (time: number): CSSProperties => ({
    '--pos': ((time - rangeStart) * 100) / (rangeEnd - rangeStart) + '%',
  });
  for (
    let i = day0 + 1, e = dayN;
    i <= e && xNotches.length < 1000;
    i += dayStep
  ) {
    xNotches.push(<div key={i} className="notch" style={posStyle(i * DAY)} />);
  }

  return (
    <section className="mood-line-editor">
      {onAddPath || onUpdatePath ? (
        <Toolbox tools={tools} current={tool} onChange={setTool} />
      ) : null}
      <DrawingCanvas
        className="drawing-area"
        paths={paths}
        livePathID={myID}
        onAddPath={onAddPath}
        onUpdatePath={onUpdatePath}
        activeTool={onAddPath || onUpdatePath ? tool : null}
        viewbox={[
          rangeStart * TIME_SCALE,
          0,
          (rangeEnd - rangeStart) * TIME_SCALE,
          1000,
        ]}
        liveEventPrefix={`moodline${group ? `-${group}` : ''}:`}
      >
        <div className="x-axis">
          <div className="line" />
          <div className="label">Time</div>
          {events.map((ev, i) => (
            <div
              key={ev.id}
              className={`event-line n${i % 2}`}
              style={posStyle(ev.doneTime)}
            />
          ))}
          {xNotches}
          {events.map((ev, i) => (
            <div
              key={ev.id}
              className={`event-label n${i % 2}`}
              style={posStyle(ev.doneTime)}
            >
              <span>{ev.message}</span>
            </div>
          ))}
        </div>
        <div className="y-axis">
          <div className="line" />
          <div className="label">Mood</div>
          <div className="label-top">{'\uD83D\uDE03'}</div>
          <div className="label-bottom">{'\uD83D\uDE22'}</div>
        </div>
      </DrawingCanvas>
      {onAddLesson ? (
        <AddLesson onAddItem={onAddLesson} group={group} narrow />
      ) : null}
    </section>
  );
};

const DAY = 1000 * 60 * 60 * 24;
const TIME_SCALE = 1 / (1000 * 60 * 60); // 1 unit = 1 hour

declare module 'csstype' {
  interface Properties {
    [k: `--${string}`]: string;
  }
}
