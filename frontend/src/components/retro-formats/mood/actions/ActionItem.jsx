import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ItemEditing from '../ItemEditing';
import WrappedButton from '../../../common/WrappedButton';
import useBoundCallback from '../../../../hooks/useBoundCallback';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../api/dataStructurePropTypes';
import './ActionItem.less';

const ActionItem = ({
  item,
  onSetDone,
  onEdit,
  onDelete,
}) => {
  const handleToggleDone = useBoundCallback(onSetDone, item.id, !item.done);
  const handleDelete = useBoundCallback(onDelete, item.id);

  const [editing, setEditing] = useState(false);
  const handleBeginEdit = useBoundCallback(setEditing, true);
  const handleCancelEdit = useBoundCallback(setEditing, false);
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
      <WrappedButton
        title={item.done ? 'Mark as not done' : 'Mark as done'}
        className="toggle-done"
        onClick={handleToggleDone}
      />
      <WrappedButton
        title="Edit"
        className="edit"
        disabled={!onEdit}
        hideIfDisabled
        onClick={handleBeginEdit}
      />
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
