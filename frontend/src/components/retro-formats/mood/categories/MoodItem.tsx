import { memo } from 'react';
import {
  type RetroItem,
  type UserProvidedRetroItemDetails,
} from '../../../../shared/api-entities';
import { MoodItemPlain } from './MoodItemPlain';
import { MoodItemFocused } from './MoodItemFocused';
import { ItemEditor } from '../ItemEditor';
import { useEvent } from '../../../../hooks/useEvent';
import { useBoolean } from '../../../../hooks/useBoolean';
import TickBold from '../../../../../resources/tick-bold.svg';
import './MoodItem.less';

interface PropsT {
  item: RetroItem;
  focused?: boolean;
  focusedItemTimeout?: number;
  autoScroll?: boolean;
  onEdit?:
    | ((id: string, diff: Partial<UserProvidedRetroItemDetails>) => void)
    | undefined;
  onAddExtraTime?: ((time: number) => void) | undefined;
  onVote?: ((id: string) => void) | undefined;
  onDelete?: ((id: string) => void) | undefined;
  onSelect?: ((id: string) => void) | undefined;
  onCancel?: ((id: string) => void) | undefined;
  onContinue?: ((id: string) => void) | undefined;
}

export const MoodItem = memo(
  ({
    item,
    focused = false,
    focusedItemTimeout = 0,
    autoScroll = false,
    onEdit,
    onAddExtraTime,
    onVote,
    onDelete,
    onSelect,
    onCancel,
    onContinue,
  }: PropsT) => {
    const handleVote = useEvent(() => onVote?.(item.id));
    const handleDelete = useEvent(() => onDelete?.(item.id));
    const handleSelect = useEvent(() => onSelect?.(item.id));
    const handleCancel = useEvent(() => onCancel?.(item.id));
    const handleContinue = useEvent(() => onContinue?.(item.id));

    const editing = useBoolean(false);
    const handleSaveEdit = useEvent(
      (diff: Partial<UserProvidedRetroItemDetails>) => {
        editing.setFalse();
        onEdit!(item.id, diff);
      },
    );

    if (editing.value) {
      return (
        <div className="mood-item editing">
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
            allowAttachments
            autoFocus
          />
        </div>
      );
    }

    if (focused) {
      return (
        <MoodItemFocused
          item={item}
          focusedItemTimeout={focusedItemTimeout}
          onAddExtraTime={onAddExtraTime}
          autoScroll={autoScroll}
          onCancel={onCancel ? handleCancel : undefined}
          onContinue={onContinue ? handleContinue : undefined}
        />
      );
    }

    return (
      <MoodItemPlain
        item={item}
        onVote={onVote ? handleVote : undefined}
        onEdit={onEdit ? editing.setTrue : undefined}
        onSelect={onSelect ? handleSelect : undefined}
      />
    );
  },
);
