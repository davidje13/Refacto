import { memo } from 'react';
import { classNames } from '../../../../helpers/classNames';
import type {
  RetroItem,
  UserProvidedRetroItemDetails,
} from '../../../../shared/api-entities';
import { ItemEditor } from '../ItemEditor';
import { useEvent } from '../../../../hooks/useEvent';
import { useOptionalBoundEvent } from '../../../../hooks/useBoundEvent';
import { useBoolean } from '../../../../hooks/useBoolean';
import Tick from '../../../../../resources/tick.svg';
import TickBold from '../../../../../resources/tick-bold.svg';
import './ActionItem.css';

interface PropsT {
  item: RetroItem;
  onSetDone?: ((id: string, done: boolean) => void) | undefined;
  onEdit?:
    | ((id: string, diff: Partial<UserProvidedRetroItemDetails>) => void)
    | undefined;
  onDelete?: ((id: string) => void) | undefined;
}

export const ActionItem = memo(
  ({ item, onSetDone, onEdit, onDelete }: PropsT) => {
    const done = item.doneTime > 0;

    const handleDelete = useOptionalBoundEvent(onDelete, item.id);

    const editing = useBoolean(false);
    const handleSaveEdit = useEvent(
      (diff: Partial<UserProvidedRetroItemDetails>) => {
        editing.setFalse();
        onEdit!(item.id, diff);
      },
    );

    if (editing.value) {
      return (
        <div className="action-item editing">
          <ItemEditor
            defaultItem={item}
            submitButtonLabel={
              <>
                <TickBold /> Save
              </>
            }
            submitButtonTitle="Save changes"
            onSubmit={handleSaveEdit}
            onDelete={onDelete ? handleDelete : undefined}
            onCancel={editing.setFalse}
            autoFocus
          />
        </div>
      );
    }

    return (
      <div className={classNames('action-item', { done })}>
        <div className="message">{item.message}</div>
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          disabled={!onSetDone}
          title={done ? 'Mark as not done' : 'Mark as done'}
          className="toggle-done"
          onClick={() => onSetDone?.(item.id, !done)}
        >
          <Tick />
        </button>
        {onEdit && (
          <button
            type="button"
            title="Edit"
            className="edit"
            onClick={editing.setTrue}
          />
        )}
      </div>
    );
  },
);
