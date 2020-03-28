import React from 'react';
import PropTypes from 'prop-types';
import type { RetroItem } from 'refacto-entities';
import { propTypesShapeItem } from '../../../api/dataStructurePropTypes';

function itemCreatedComparator(a: RetroItem, b: RetroItem): number {
  // sort newer-to-older
  return b.created - a.created;
}

function sortItems(items: RetroItem[]): RetroItem[] {
  const sorted = items.slice();
  sorted.sort(itemCreatedComparator);
  return sorted;
}

interface ItemPropsP {
  item: RetroItem;
  focused: boolean;
}

interface PropsT<P> {
  items: RetroItem[];
  ItemType: React.ComponentType<P>;
  focusedItemId?: string | null;
  itemProps: Omit<P, 'item' | 'focused'>;
}

function ItemColumn<P extends Partial<ItemPropsP>>({
  items,
  ItemType,
  focusedItemId,
  itemProps,
}: PropsT<P>): React.ReactElement {
  const AnyItemType = ItemType as any;
  return (
    <ul className="item-column">
      { sortItems(items).map((item) => (
        <li key={item.id}>
          <AnyItemType item={item} focused={item.id === focusedItemId} {...itemProps} />
        </li>
      )) }
    </ul>
  );
}

ItemColumn.propTypes = {
  items: PropTypes.arrayOf(propTypesShapeItem).isRequired,
  ItemType: PropTypes.elementType.isRequired,
  focusedItemId: PropTypes.string,
  itemProps: PropTypes.shape({}).isRequired,
};

ItemColumn.defaultProps = {
  focusedItemId: null,
};

export default ItemColumn;
