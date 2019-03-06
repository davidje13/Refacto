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
    focusedItemUUID: PropTypes.string,
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
    focusedItemUUID: null,
    focusedItemTimeout: 0,
  };

  handleAddItem = (message) => {
    const { category, onAddItem } = this.props;

    onAddItem(category, message);
  };

  handleItemSelect = (uuid) => {
    const { onSwitchFocus, onSetDone, focusedItemUUID } = this.props;

    if (focusedItemUUID !== null && focusedItemUUID !== uuid) {
      onSetDone(focusedItemUUID, true);
    }
    onSwitchFocus(uuid);
  };

  handleItemCancel = (uuid) => {
    const { onSwitchFocus, onSetDone } = this.props;

    onSetDone(uuid, false);
    onSwitchFocus(null);
  };

  handleItemDone = (uuid) => {
    const { onSwitchFocus, onSetDone } = this.props;

    onSetDone(uuid, true);
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
      focusedItemUUID,
      focusedItemTimeout,
    } = this.props;

    return (
      <section className={category}>
        <header>
          <h2>{category}</h2>
          { onAddItem ? (
            <ExpandingTextEntry
              onSubmit={this.handleAddItem}
              submitButtonTitle="Add"
              placeholder={addItemPlaceholder}
              clearAfterSubmit
            />
          ) : null }
        </header>
        <ItemColumn
          items={items.filter((item) => (item.category === category))}
          ItemType={MoodItem}
          focusedItemUUID={focusedItemUUID}
          focusedItemTimeout={focusedItemTimeout}
          onVote={onVote}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSwitchFocus === null ? null : this.handleItemSelect}
          onAddExtraTime={onAddExtraTime}
          onCancel={onSwitchFocus === null ? null : this.handleItemCancel}
          onDone={onSetDone === null ? null : this.handleItemDone}
        />
      </section>
    );
  }
}

forbidExtraProps(MoodSection);

export default MoodSection;
