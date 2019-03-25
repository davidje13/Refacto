import React from 'react';
import PropTypes from 'prop-types';
import { propTypesShapeItem } from '../../../api/dataStructurePropTypes';

function itemCreatedComparator(a, b) {
  // sort newer-to-older
  return b.created - a.created;
}

function sortItems(items) {
  const sorted = items.slice();
  sorted.sort(itemCreatedComparator);
  return sorted;
}

const ItemColumn = ({
  items,
  ItemType,
  focusedItemId,
  ...props
}) => (
  <ul className="item-column">
    { sortItems(items).map((item) => (
      <li key={item.id}>
        <ItemType item={item} focused={item.id === focusedItemId} {...props} />
      </li>
    )) }
  </ul>
);

ItemColumn.propTypes = {
  items: PropTypes.arrayOf(propTypesShapeItem).isRequired,
  ItemType: PropTypes.elementType.isRequired,
  focusedItemId: PropTypes.string,
};

ItemColumn.defaultProps = {
  focusedItemId: null,
};

export default React.memo(ItemColumn);
