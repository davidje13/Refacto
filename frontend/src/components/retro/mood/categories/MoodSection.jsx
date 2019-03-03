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
    focusedItemUUID: PropTypes.string,
  };

  static defaultProps = {
    addItemPlaceholder: '',
    onAddItem: null,
    onVote: null,
    onEdit: null,
    onDelete: null,
    focusedItemUUID: null,
  };

  handleAddItem = (message) => {
    const { category, onAddItem } = this.props;

    onAddItem(category, message);
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
      focusedItemUUID,
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
          onVote={onVote}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </section>
    );
  }
}

forbidExtraProps(MoodSection);

export default MoodSection;
