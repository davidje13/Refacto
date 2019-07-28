import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import MoodItemPlain from './MoodItemPlain';
import MoodItemFocused from './MoodItemFocused';
import ItemEditing from '../ItemEditing';
import useBoundCallback from '../../../../hooks/useBoundCallback';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../api/dataStructurePropTypes';
import './MoodItem.less';
import RetroItem from '../../../../data/RetroItem';

interface PropsT {
  item: RetroItem;
  focused: boolean;
  focusedItemTimeout: number;
  onEdit?: (id: string, message: string) => void;
  onAddExtraTime?: (time: number) => void;
  onVote?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSelect?: (id: string) => void;
  onCancel?: (id: string) => void;
  onDone?: (id: string) => void;
}

const MoodItem = ({
  item,
  focused,
  focusedItemTimeout,
  onEdit,
  onAddExtraTime,
  onVote,
  onDelete,
  onSelect,
  onCancel,
  onDone,
}: PropsT): React.ReactElement => {
  const handleVote = useBoundCallback(onVote, item.id);
  const handleDelete = useBoundCallback(onDelete, item.id);
  const handleSelect = useBoundCallback(onSelect, item.id);
  const handleCancel = useBoundCallback(onCancel, item.id);
  const handleDone = useBoundCallback(onDone, item.id);

  const [editing, setEditing] = useState(false);
  const handleBeginEdit = useBoundCallback(setEditing, true);
  const handleCancelEdit = useBoundCallback(setEditing, false);
  const handleSaveEdit = useCallback((message) => {
    setEditing(false);
    onEdit!(item.id, message);
  }, [setEditing, onEdit, item.id]);

  if (editing) {
    return (
      <ItemEditing
        className="mood-item"
        message={item.message}
        onSubmit={handleSaveEdit}
        onCancel={handleCancelEdit}
        onDelete={handleDelete}
      />
    );
  }

  if (focused) {
    return (
      <MoodItemFocused
        item={item}
        focusedItemTimeout={focusedItemTimeout}
        onAddExtraTime={onAddExtraTime}
        onCancel={handleCancel}
        onDone={handleDone}
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

MoodItem.propTypes = {
  item: propTypesShapeItem.isRequired,
  focused: PropTypes.bool,
  focusedItemTimeout: PropTypes.number,
  onVote: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onSelect: PropTypes.func,
  onAddExtraTime: PropTypes.func,
  onCancel: PropTypes.func,
  onDone: PropTypes.func,
};

MoodItem.defaultProps = {
  focused: false,
  focusedItemTimeout: 0,
  onVote: undefined,
  onEdit: undefined,
  onDelete: undefined,
  onSelect: undefined,
  onAddExtraTime: undefined,
  onCancel: undefined,
  onDone: undefined,
};

forbidExtraProps(MoodItem);

export default React.memo(MoodItem);
