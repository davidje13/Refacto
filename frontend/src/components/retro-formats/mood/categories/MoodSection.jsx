import React from 'react';
import PropTypes from 'prop-types';
import MoodItem from './MoodItem';
import ItemColumn from '../ItemColumn';
import ExpandingTextEntry from '../../../common/ExpandingTextEntry';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../helpers/dataStructurePropTypes';

export class MoodSection extends React.PureComponent {
  static propTypes = {
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

  static defaultProps = {
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

  handleAddItem = (message) => {
    const { category, onAddItem } = this.props;

    onAddItem(category, message);
  };

  handleItemSelect = (id) => {
    const { onSwitchFocus, onSetDone, focusedItemId } = this.props;

    if (focusedItemId !== null && focusedItemId !== id) {
      onSetDone?.(focusedItemId, true);
    }
    onSwitchFocus(id);
  };

  handleItemCancel = (id) => {
    const { onSwitchFocus, onSetDone } = this.props;

    onSetDone?.(id, false);
    onSwitchFocus(null);
  };

  handleItemDone = (id) => {
    const { onSwitchFocus, onSetDone } = this.props;

    onSetDone?.(id, true);
    onSwitchFocus(null);
  };

  render() {
    const {
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
    } = this.props;

    return (
      <section className={category}>
        <header>
          <h2>{category}</h2>
          { onAddItem && (
            <ExpandingTextEntry
              onSubmit={this.handleAddItem}
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
          onSelect={onSwitchFocus && this.handleItemSelect}
          onAddExtraTime={onAddExtraTime}
          onCancel={onSwitchFocus && this.handleItemCancel}
          onDone={onSetDone && this.handleItemDone}
        />
      </section>
    );
  }
}

forbidExtraProps(MoodSection);

export default MoodSection;
