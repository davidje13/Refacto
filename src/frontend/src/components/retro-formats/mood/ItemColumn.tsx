import React from 'react';
import type { RetroItem } from 'refacto-entities';

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

export default ItemColumn;
