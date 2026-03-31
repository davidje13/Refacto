import { memo, type ReactNode } from 'react';
import Cross from '../../../../../resources/cross.svg';
import Delete from '../../../../../resources/delete.svg';
import type { RetroItem } from '../../../../shared/api-entities';
import { isoDate, readIsoDate } from '../../../../time/formatters';
import { useEvent } from '../../../../hooks/useEvent';
import { useStateMap } from '../../../../hooks/useStateMap';
import { ExpandingTextEntry } from '../../../common/ExpandingTextEntry';

export type EventItem = Pick<RetroItem, 'message' | 'doneTime'>;

interface PropsT {
  defaultItem?: RetroItem;
  identifier?: string | undefined;
  onSubmit: (itemParts: Partial<EventItem>) => void;
  onCancel?: (() => void) | undefined;
  onDelete?: (() => void) | undefined;
  onChange?: ((value: string) => void) | undefined;
  placeholder?: string;
  autoFocus?: boolean;
  submitButtonLabel?: ReactNode;
  submitButtonTitle?: string;
  clearAfterSubmit?: boolean;
  blurOnSubmit?: boolean;
  blurOnCancel?: boolean;
}

export const EventEditor = memo(
  ({
    defaultItem,
    identifier,
    onSubmit,
    onCancel,
    onDelete,
    onChange,
    clearAfterSubmit = false,
    ...rest
  }: PropsT) => {
    const [date, setDate] = useStateMap(
      identifier,
      'date',
      defaultItem ? isoDate(defaultItem.doneTime) : '',
    );
    const handleSubmit = useEvent((message: string) => {
      const doneTime = readIsoDate(date);
      if (doneTime) {
        onSubmit({ message, doneTime });
      }
      if (clearAfterSubmit) {
        setDate('');
      }
    });

    return (
      <ExpandingTextEntry
        defaultValue={defaultItem?.message ?? ''}
        identifier={identifier}
        onChange={onChange}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        preSubmitOptions={[
          <label key="date" className="datepicker">
            On{' '}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.currentTarget.value)}
              required
            />
          </label>,
          onDelete ? (
            <button
              key="delete"
              type="button"
              title="Delete"
              className="delete"
              onClick={onDelete}
            >
              <Delete role="presentation" /> Delete
            </button>
          ) : null,
        ]}
        postSubmitOptions={[
          onCancel ? (
            <button
              key="cancel"
              type="button"
              title="Cancel"
              className="cancel"
              onClick={onCancel}
            >
              <Cross aria-label="Cancel" role="img" />
            </button>
          ) : null,
        ]}
        forceMultiline={Boolean(onCancel || onDelete)}
        clearAfterSubmit={clearAfterSubmit}
        disabled={!date}
        {...rest}
      />
    );
  },
);
