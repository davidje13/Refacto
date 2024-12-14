import { memo } from 'react';
import { classNames } from '../../../../helpers/classNames';
import {
  type RetroItem,
  type UserProvidedRetroItemDetails,
} from '../../../../shared/api-entities';
import { ItemEditor } from '../ItemEditor';
import { WrappedButton } from '../../../common/WrappedButton';
import { useEvent } from '../../../../hooks/useEvent';
import { useBoolean } from '../../../../hooks/useBoolean';
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

    const handleToggleDone = useEvent(() => onSetDone?.(item.id, !done));
    const handleDelete = useEvent(() => onDelete?.(item.id));

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
        <WrappedButton
          role="checkbox"
          aria-checked={done}
          title={done ? 'Mark as not done' : 'Mark as done'}
          className="toggle-done"
          onClick={onSetDone ? handleToggleDone : undefined}
        >
          <Tick />
        </WrappedButton>
        <WrappedButton
          title="Edit"
          className="edit"
          disabled={!onEdit}
          hideIfDisabled
          onClick={editing.setTrue}
        />
      </div>
    );
  },
);
