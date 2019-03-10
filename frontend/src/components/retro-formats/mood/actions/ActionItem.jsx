import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ItemEditing from '../ItemEditing';
import useBoundCallback from '../../../../hooks/useBoundCallback';
import useStrippedCallback from '../../../../hooks/useStrippedCallback';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../helpers/dataStructurePropTypes';
import './ActionItem.less';

export const ActionItem = ({
  item,
  onSetDone,
  onEdit,
  onDelete,
}) => {
  const handleToggleDone = useStrippedCallback(onSetDone, item.id, !item.done);
  const handleDelete = useBoundCallback(onDelete, item.id);

  const [editing, setEditing] = useState(false);
  const handleBeginEdit = useStrippedCallback(setEditing, true);
  const handleCancelEdit = useStrippedCallback(setEditing, false);
  const handleSaveEdit = useCallback((message) => {
    setEditing(false);
    onEdit(item.id, message);
  }, [setEditing, onEdit, item.id]);

  if (editing) {
    return (
      <ItemEditing
        className="action-item"
        message={item.message}
        onSubmit={handleSaveEdit}
        onCancel={handleCancelEdit}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div className={classNames('action-item', { done: item.done })}>
      <div className="message">{ item.message }</div>
      <button
        type="button"
        title={item.done ? 'Mark as not done' : 'Mark as done'}
        className="toggle-done"
        disabled={!handleToggleDone}
        onClick={handleToggleDone}
      />
      { onEdit && (
        <button
          type="button"
          title="Edit"
          className="edit"
          onClick={handleBeginEdit}
        />
      ) }
    </div>
  );
};

ActionItem.propTypes = {
  item: propTypesShapeItem.isRequired,
  onSetDone: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

ActionItem.defaultProps = {
  onSetDone: null,
  onEdit: null,
  onDelete: null,
};

forbidExtraProps(ActionItem, { alsoAllow: ['focused'] });

export default React.memo(ActionItem);
