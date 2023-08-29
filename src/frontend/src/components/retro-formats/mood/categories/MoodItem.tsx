import React, { useState, useCallback, memo } from 'react';
import type {
  RetroItem,
  UserProvidedRetroItemDetails,
} from '../../../../shared/api-entities';
import MoodItemPlain from './MoodItemPlain';
import MoodItemFocused from './MoodItemFocused';
import ItemEditor from '../ItemEditor';
import useBoundCallback from '../../../../hooks/useBoundCallback';
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

export default memo(
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
    const handleVote = useBoundCallback(onVote, item.id);
    const handleDelete = useBoundCallback(onDelete, item.id);
    const handleSelect = useBoundCallback(onSelect, item.id);
    const handleCancel = useBoundCallback(onCancel, item.id);
    const handleContinue = useBoundCallback(onContinue, item.id);

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
        <div className="mood-item editing">
          <ItemEditor
            defaultItem={item}
            submitButtonLabel={
              <React.Fragment>
                <TickBold /> Save
              </React.Fragment>
            }
            submitButtonTitle="Save changes"
            onSubmit={handleSaveEdit}
            onDelete={handleDelete}
            onCancel={handleCancelEdit}
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
          onContinue={handleContinue}
        />
      );
    }

    return (
      <MoodItemPlain
        item={item}
        onVote={handleVote}
        onEdit={onEdit ? handleBeginEdit : undefined}
        onSelect={handleSelect}
      />
    );
  },
);
