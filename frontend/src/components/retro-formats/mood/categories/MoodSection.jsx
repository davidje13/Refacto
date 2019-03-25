import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import MoodItem from './MoodItem';
import ItemColumn from '../ItemColumn';
import ExpandingTextEntry from '../../../common/ExpandingTextEntry';
import useBoundCallback from '../../../../hooks/useBoundCallback';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../api/dataStructurePropTypes';

const MoodSection = ({
  category,
  items,
  addItemPlaceholder,
  onAddItem,
  onVote,
  onEdit,
  onDelete,
  onSetDone,
  onSwitchFocus,
  onAddExtraTime,
  focusedItemId,
  focusedItemTimeout,
}) => {
  const handleAddItem = useBoundCallback(onAddItem, category);

  const handleItemSelect = useCallback((id) => {
    onSwitchFocus(id, true);
  }, [onSwitchFocus]);

  const handleItemCancel = useCallback((id) => {
    onSetDone?.(id, false);
    onSwitchFocus?.(null, false);
  }, [onSwitchFocus, onSetDone]);

  const handleItemDone = useCallback((id) => {
    onSetDone?.(id, true);
    onSwitchFocus?.(null, false);
  }, [onSwitchFocus, onSetDone]);

  return (
    <section className={category}>
      <header>
        <h2>{category}</h2>
        { onAddItem && (
          <ExpandingTextEntry
            onSubmit={handleAddItem}
            submitButtonTitle="Add"
            placeholder={addItemPlaceholder}
            clearAfterSubmit
          />
        ) }
      </header>
      <ItemColumn
        items={items.filter((item) => (item.category === category))}
        ItemType={MoodItem}
        focusedItemId={focusedItemId}
        focusedItemTimeout={focusedItemTimeout}
        onVote={onVote}
        onEdit={onEdit}
        onDelete={onDelete}
        onSelect={onSwitchFocus && handleItemSelect}
        onAddExtraTime={onAddExtraTime}
        onCancel={onSwitchFocus && handleItemCancel}
        onDone={onSetDone && handleItemDone}
      />
    </section>
  );
};

MoodSection.propTypes = {
  category: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(propTypesShapeItem).isRequired,
  addItemPlaceholder: PropTypes.string,
  onAddItem: PropTypes.func,
  onVote: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onSwitchFocus: PropTypes.func,
  onSetDone: PropTypes.func,
  onAddExtraTime: PropTypes.func,
  focusedItemId: PropTypes.string,
  focusedItemTimeout: PropTypes.number,
};

MoodSection.defaultProps = {
  addItemPlaceholder: '',
  onAddItem: null,
  onVote: null,
  onEdit: null,
  onDelete: null,
  onSwitchFocus: null,
  onSetDone: null,
  onAddExtraTime: null,
  focusedItemId: null,
  focusedItemTimeout: 0,
};

forbidExtraProps(MoodSection);

export default React.memo(MoodSection);
