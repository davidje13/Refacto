import {
  useEffect,
  useRef,
  type FunctionComponent,
  type HTMLProps,
} from 'react';
import type { RetroItem } from '@refacto/shared/api-entities';
import TickBold from '../../../../../resources/tick-bold.svg';
import { useBoolean } from '../../../../hooks/useBoolean';
import { useOptionalBoundEvent } from '../../../../hooks/useBoundEvent';
import { formatDate, isoDate, readIsoDate } from '../../../../time/formatters';
import { EventEditor, type EventItem } from './EventEditor';
import './EventListEditor.css';

interface PropsT {
  events: RetroItem[];
  rangeStart: number;
  rangeEnd: number;
  onChangeRangeStart?: ((time: number) => void) | undefined;
  onChangeRangeEnd?: ((time: number) => void) | undefined;
  onAddEvent?: ((item: Partial<EventItem>) => void) | undefined;
  onEditEvent?:
    | ((itemId: string, changes: Partial<EventItem>) => void)
    | undefined;
  onDeleteEvent?: ((itemId: string) => void) | undefined;
}

export const EventListEditor: FunctionComponent<PropsT> = ({
  events,
  rangeStart,
  rangeEnd,
  onChangeRangeStart,
  onChangeRangeEnd,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
}) => (
  <section className="event-list-editor">
    <div className="content">
      {onAddEvent ? (
        <EventEditor
          onSubmit={onAddEvent}
          identifier="event"
          placeholder="Add event"
          submitButtonLabel={<TickBold aria-label="Add event" role="img" />}
          submitButtonTitle="Add"
          clearAfterSubmit
        />
      ) : null}
      <ol className="timeline">
        <li>
          {onChangeRangeStart ? (
            <label>
              <SemiControlledInput
                type="date"
                required
                value={isoDate(rangeStart)}
                onChange={(e) => {
                  const tm = readIsoDate(e.currentTarget.value);
                  if (tm) {
                    onChangeRangeStart(tm);
                  }
                }}
              />{' '}
              Timeline begins
            </label>
          ) : (
            formatDate(rangeStart) + ': Timeline begins'
          )}
        </li>
        {events.map((ev) => (
          <EventListItem
            key={ev.id}
            item={ev}
            onEditEvent={onEditEvent}
            onDeleteEvent={onDeleteEvent}
          />
        ))}
        <li>
          {onChangeRangeEnd ? (
            <label>
              <SemiControlledInput
                type="date"
                required
                value={isoDate(rangeEnd)}
                onChange={(e) => {
                  const tm = readIsoDate(e.currentTarget.value);
                  if (tm) {
                    onChangeRangeEnd(tm);
                  }
                }}
              />{' '}
              Timeline ends
            </label>
          ) : (
            formatDate(rangeEnd) + ': Timeline ends'
          )}
        </li>
      </ol>
    </div>
  </section>
);

const SemiControlledInput: FunctionComponent<
  HTMLProps<HTMLInputElement> & { value: string }
> = ({ value, ...props }) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.value = value;
    }
  }, [value]);
  return <input ref={ref} {...props} />;
};

interface EventListItemPropsT {
  item: RetroItem;
  onEditEvent?:
    | ((itemId: string, changes: Partial<EventItem>) => void)
    | undefined;
  onDeleteEvent?: ((itemId: string) => void) | undefined;
}

const EventListItem: FunctionComponent<EventListItemPropsT> = ({
  item,
  onEditEvent,
  onDeleteEvent,
}) => {
  const handleDelete = useOptionalBoundEvent(onDeleteEvent, item.id);
  const editing = useBoolean(false);

  if (editing.value && onEditEvent) {
    return (
      <li key={item.id}>
        <EventEditor
          defaultItem={item}
          submitButtonLabel={
            <>
              <TickBold role="presentation" /> Save
            </>
          }
          submitButtonTitle="Save changes"
          onSubmit={(diff) => {
            editing.setFalse();
            onEditEvent(item.id, diff);
          }}
          onDelete={handleDelete}
          onCancel={editing.setFalse}
          autoFocus
        />
      </li>
    );
  } else {
    return (
      <li key={item.id}>
        {formatDate(item.doneTime)}: {item.message}
        {onEditEvent ? (
          <button
            type="button"
            title="Edit"
            className="edit"
            onClick={editing.setTrue}
          />
        ) : null}
      </li>
    );
  }
};
