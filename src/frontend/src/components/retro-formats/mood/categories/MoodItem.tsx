import React, { useState, useCallback } from 'react';
import type { RetroItem, UserProvidedRetroItemDetails } from 'refacto-entities';
import MoodItemPlain from './MoodItemPlain';
import MoodItemFocused from './MoodItemFocused';
import ItemEditor from '../ItemEditor';
import useBoundCallback from '../../../../hooks/useBoundCallback';
import './MoodItem.less';

interface PropsT {
  item: RetroItem;
  focused: boolean;
  focusedItemTimeout: number;
  autoScroll: boolean;
  onEdit?: (id: string, diff: Partial<UserProvidedRetroItemDetails>) => void;
  onAddExtraTime?: (time: number) => void;
  onVote?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSelect?: (id: string) => void;
  onCancel?: (id: string) => void;
  onContinue?: (id: string) => void;
}

const MoodItem = ({
  item,
  focused,
  focusedItemTimeout,
  autoScroll,
  onEdit,
  onAddExtraTime,
  onVote,
  onDelete,
  onSelect,
  onCancel,
  onContinue,
}: PropsT): React.ReactElement => {
  const handleVote = useBoundCallback(onVote, item.id);
  const handleDelete = useBoundCallback(onDelete, item.id);
  const handleSelect = useBoundCallback(onSelect, item.id);
  const handleCancel = useBoundCallback(onCancel, item.id);
  const handleContinue = useBoundCallback(onContinue, item.id);

  const [editing, setEditing] = useState(false);
  const handleBeginEdit = useBoundCallback(setEditing, true);
  const handleCancelEdit = useBoundCallback(setEditing, false);
  const handleSaveEdit = useCallback((
    diff: Partial<UserProvidedRetroItemDetails>,
  ) => {
    setEditing(false);
    onEdit!(item.id, diff);
  }, [setEditing, onEdit, item.id]);

  if (editing) {
    /* eslint-disable jsx-a11y/no-autofocus */ // user triggered this
    return (
      <div className="mood-item editing">
        <ItemEditor
          defaultItem={item}
          submitButtonLabel="Save"
          submitButtonTitle="Save changes"
          onSubmit={handleSaveEdit}
          onDelete={handleDelete}
          onCancel={handleCancelEdit}
          allowAttachments
          autoFocus
        />
      </div>
    );
    /* eslint-enable jsx-a11y/no-autofocus */
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
};

MoodItem.defaultProps = {
  focused: false,
  focusedItemTimeout: 0,
  autoScroll: false,
  onVote: undefined,
  onEdit: undefined,
  onDelete: undefined,
  onSelect: undefined,
  onAddExtraTime: undefined,
  onCancel: undefined,
  onContinue: undefined,
};

export default React.memo(MoodItem);
