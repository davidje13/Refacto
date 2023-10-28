import { useState, useCallback, memo } from 'react';
import classNames from 'classnames';
import {
  type RetroItem,
  type UserProvidedRetroItemDetails,
} from '../../../../shared/api-entities';
import { ItemEditor } from '../ItemEditor';
import { WrappedButton } from '../../../common/WrappedButton';
import { useBoundCallback } from '../../../../hooks/useBoundCallback';
import Tick from '../../../../../resources/tick.svg';
import TickBold from '../../../../../resources/tick-bold.svg';
import './ActionItem.less';

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

    const handleToggleDone = useBoundCallback(onSetDone, item.id, !done);
    const handleDelete = useBoundCallback(onDelete, item.id);

    const [editing, setEditing] = useState(false);
    const handleBeginEdit = useBoundCallback(setEditing, true);
    const handleCancelEdit = useBoundCallback(setEditing, false);
    const handleSaveEdit = useCallback(
      (diff: Partial<UserProvidedRetroItemDetails>) => {
        setEditing(false);
        onEdit!(item.id, diff);
      },
      [setEditing, onEdit, item.id],
    );

    if (editing) {
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
            onDelete={handleDelete}
            onCancel={handleCancelEdit}
            autoFocus
          />
        </div>
      );
    }

    return (
      <div className={classNames('action-item', { done })}>
        <div className="message">{item.message}</div>
        <WrappedButton
          role="checkbox"
          aria-checked={done}
          title={done ? 'Mark as not done' : 'Mark as done'}
          className="toggle-done"
          onClick={handleToggleDone}
        >
          <Tick />
        </WrappedButton>
        <WrappedButton
          title="Edit"
          className="edit"
          disabled={!onEdit}
          hideIfDisabled
          onClick={handleBeginEdit}
        />
      </div>
    );
  },
);
