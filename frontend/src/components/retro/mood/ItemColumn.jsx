import React from 'react';
import PropTypes from 'prop-types';
import { propTypesShapeItem } from '../../../helpers/dataStructurePropTypes';

function itemCreatedComparator(a, b) {
  // sort newer-to-older
  return b.created - a.created;
}

function sortItems(items) {
  const sorted = items.slice();
  sorted.sort(itemCreatedComparator);
  return sorted;
}

export const ItemColumn = ({
  items,
  ItemType,
  focusedItemUUID,
  ...props
}) => (
  <ul className="item-column">
    { sortItems(items).map((item) => (
      <li key={item.uuid}>
        <ItemType item={item} focused={item.uuid === focusedItemUUID} {...props} />
      </li>
    )) }
  </ul>
);

ItemColumn.propTypes = {
  items: PropTypes.arrayOf(propTypesShapeItem).isRequired,
  ItemType: PropTypes.elementType.isRequired,
  focusedItemUUID: PropTypes.string,
};

ItemColumn.defaultProps = {
  focusedItemUUID: null,
};

export default ItemColumn;
