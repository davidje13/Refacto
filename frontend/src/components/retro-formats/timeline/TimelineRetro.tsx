import { useMemo, type FunctionComponent } from 'react';
import type { RetroItem } from '@refacto/shared/api-entities';
import { classNames } from '../../../helpers/classNames';
import { randomUUID } from '../../../helpers/crypto';
import {
  addPath,
  setEndTime,
  setStartTime,
  updatePath,
  type TimelineRetroStateT,
} from '../../../actions/timelineRetro';
import {
  addRetroItem,
  deleteRetroItem,
  editRetroItem,
} from '../../../actions/retro';
import { useActionFactory } from '../../../hooks/useActionFactory';
import { useOptionalBoundEvent } from '../../../hooks/useBoundEvent';
import { useStateMap } from '../../../hooks/useStateMap';
import { useLocalDateProvider } from '../../../hooks/env/useLocalDateProvider';
import type { LocalDateProvider } from '../../../time/LocalDateProvider';
import { LoadingError } from '../../common/Loader';
import { TabControl, type TabT } from '../../common/TabControl';
import type { RetroFormatProps } from '../formats';
import { EventListEditor } from './events-editor/EventListEditor';
import { LessonsPane } from './lessons/LessonsPane';
import { MoodLineEditor } from './mood-line/MoodLineEditor';
import type { Path, Tool } from './mood-line/drawing-canvas/DrawingCanvas';
import './TimelineRetro.css';
import { ItemToast } from '../../items/ItemToast';

const TOOL_ERASER: Tool = { type: 'eraser', name: 'Eraser', radius: 20 };

export const TimelineRetro: FunctionComponent<
  RetroFormatProps<TimelineRetroStateT>
> = ({
  className,
  dispatch,
  retroItems,
  retroState,
  group,
  archive,
  archiveTime,
}) => {
  const [myID] = useStateMap('timeline:id', randomUUID, true);
  const tools = useMemo<Tool[]>(
    () => [
      { type: 'pen', name: 'Pen', colour: colourForID(myID) },
      TOOL_ERASER,
    ],
    [myID],
  );

  const useAction = useActionFactory(dispatch);
  const handleAddPath = useOptionalBoundEvent(useAction(addPath), group, myID);
  const handleUpdatePath = useOptionalBoundEvent(useAction(updatePath), myID);
  const handleAddEvent = useOptionalBoundEvent(
    useAction(addRetroItem),
    'event',
    group,
  );
  const handleAddLesson = useOptionalBoundEvent(
    useAction(addRetroItem),
    'lesson',
  );
  const handleEditItem = useAction(editRetroItem);
  const handleDeleteItem = useAction(deleteRetroItem);
  const handleChangeRangeStart = useOptionalBoundEvent(
    useAction(setStartTime),
    group,
  );
  const handleChangeRangeEnd = useOptionalBoundEvent(
    useAction(setEndTime),
    group,
  );
  const localDateProvider = useLocalDateProvider(archiveTime);

  const paths: Path[] = [];
  for (const item of retroItems) {
    if (group && item.group && item.group !== group) {
      continue;
    }
    if (item.category === 'moodline' && item.attachment?.type === 'sketch') {
      paths.push({
        id: item.id,
        colour: item.attachment.colour,
        curve: item.attachment.curve,
      });
    }
  }

  const events = retroItems
    .filter(
      (item) =>
        item.category === 'event' &&
        (!group || !item.group || item.group === group),
    )
    .sort(doneTimeAsc);
  const range = timeRange(events, retroState, localDateProvider);

  const tabs: TabT[] = [
    {
      key: 'events',
      title: 'Events',
      className: 'events',
      content: (
        <EventListEditor
          events={events}
          rangeStart={range.start}
          rangeEnd={range.end}
          onChangeRangeStart={handleChangeRangeStart}
          onChangeRangeEnd={handleChangeRangeEnd}
          onAddEvent={handleAddEvent}
          onEditEvent={handleEditItem}
          onDeleteEvent={handleDeleteItem}
        />
      ),
    },
    {
      key: 'draw',
      title: 'Mood',
      className: 'draw',
      content: range.defined ? (
        <MoodLineEditor
          myID={myID}
          events={events}
          rangeStart={range.start}
          rangeEnd={range.end}
          paths={paths}
          onAddPath={handleAddPath}
          onUpdatePath={handleUpdatePath}
          onAddLesson={handleAddLesson}
          tools={tools}
        />
      ) : (
        <LoadingError error="Set a time range and add events to begin." />
      ),
    },
    {
      key: 'lessons',
      title: 'Lessons',
      className: 'lessons',
      content: (
        <LessonsPane
          items={retroItems}
          group={group}
          onAddItem={handleAddLesson}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
        />
      ),
    },
  ];

  return (
    <div className={classNames('retro-format-timeline', className)}>
      <TabControl
        tabs={tabs}
        identifier="timeline:tab"
        initial={archive ? 'draw' : 'events'}
      />
      {archive ? null : (
        <ItemToast
          group={group}
          category="lesson"
          items={retroItems}
          label="Lesson learned: "
        />
      )}
    </div>
  );
};

function timeRange(
  events: RetroItem[],
  retroState: TimelineRetroStateT,
  localDateProvider: LocalDateProvider,
): { start: number; end: number; defined: boolean } {
  let start = events[0]?.doneTime ?? Number.POSITIVE_INFINITY;
  let end = events[events.length - 1]?.doneTime ?? Number.NEGATIVE_INFINITY;
  const endTime = retroState.endTime;
  if (typeof endTime === 'number' && endTime > end) {
    end = endTime;
  }
  const startTime = retroState.startTime;
  if (typeof startTime === 'number' && startTime < start) {
    start = startTime;
  }
  const defined = Number.isFinite(end);
  if (!defined) {
    end = localDateProvider.getMidnightTimestamp();
  }
  const maxStart = end - 1000 * 60 * 60 * 24 * 30; // 1 month
  if (maxStart < start) {
    start = maxStart;
  }

  return { start, end, defined };
}

const colourForID = (id: string) => {
  // apply a very crude hash to the ID to get deterministic random-ish colours
  let hash = 0;
  for (const [v] of id.matchAll(/[0-9a-f]{4}/gi)) {
    hash ^= Number.parseInt(v, 16);
  }
  return { h: ((hash >>> 0) * 29) % 360 };
};

const doneTimeAsc = (a: RetroItem, b: RetroItem) =>
  a.doneTime - b.doneTime || a.created - b.created;
