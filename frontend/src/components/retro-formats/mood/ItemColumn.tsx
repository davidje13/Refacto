import React from 'react';
import PropTypes from 'prop-types';
import { propTypesShapeItem } from '../../../api/dataStructurePropTypes';
import RetroItem from '../../../data/RetroItem';

function itemCreatedComparator(a: RetroItem, b: RetroItem): number {
  // sort newer-to-older
  return b.created - a.created;
}

function sortItems(items: RetroItem[]): RetroItem[] {
  const sorted = items.slice();
  sorted.sort(itemCreatedComparator);
  return sorted;
}

interface PropsT {
  items: RetroItem[];
  ItemType: React.ElementType;
  focusedItemId?: string | null;
  [K: string]: any;
}

const ItemColumn = ({
  items,
  ItemType,
  focusedItemId,
  ...props
}: PropsT): React.ReactElement => (
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
