import { memo } from 'react';
import type {
  RetroItem,
  UserProvidedRetroItemDetails,
} from '../../../../shared/api-entities';
import { MoodItemPlain } from './MoodItemPlain';
import { MoodItemFocused } from './MoodItemFocused';
import { ItemEditor } from '../ItemEditor';
import { useEvent, useOptionalBoundEvent } from '../../../../hooks/useEvent';
import { useBoolean } from '../../../../hooks/useBoolean';
import TickBold from '../../../../../resources/tick-bold.svg';
import './MoodItem.css';

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
  onClose?: ((id: string) => void) | undefined;
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
    onClose,
    onContinue,
  }: PropsT) => {
    const handleVote = useOptionalBoundEvent(onVote, item.id);
    const handleDelete = useOptionalBoundEvent(onDelete, item.id);
    const handleSelect = useOptionalBoundEvent(onSelect, item.id);
    const handleCancel = useOptionalBoundEvent(onCancel, item.id);
    const handleClose = useOptionalBoundEvent(onClose, item.id);
    const handleContinue = useOptionalBoundEvent(onContinue, item.id);

    const editing = useBoolean(false);
    const handleSaveEdit = useEvent(
      (diff: Partial<UserProvidedRetroItemDetails>) => {
        editing.setFalse();
        onEdit!(item.id, diff);
      },
    );

    if (editing.value && onEdit) {
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
            onDelete={handleDelete}
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
          onCancel={handleCancel}
          onClose={handleClose}
          onContinue={handleContinue}
        />
      );
    }

    return (
      <MoodItemPlain
        item={item}
        onVote={handleVote}
        onEdit={onEdit ? editing.setTrue : undefined}
        onSelect={handleSelect}
      />
    );
  },
);
