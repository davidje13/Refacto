import { ElementType, ComponentPropsWithRef, ReactElement } from 'react';
import { type RetroItem } from '../../../shared/api-entities';

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

interface PropsT<C extends ElementType> {
  items: RetroItem[];
  ItemType: C;
  focusedItemId?: string | null;
  itemProps: Omit<ComponentPropsWithRef<C>, 'item' | 'focused'>;
}

export const ItemColumn = <C extends ElementType<ItemPropsP>>({
  items,
  ItemType,
  focusedItemId,
  itemProps,
}: PropsT<C>): ReactElement => (
  <ul className="item-column">
    {sortItems(items).map((item) => (
      <li key={item.id}>
        <ItemType
          item={item}
          focused={item.id === focusedItemId}
          {...(itemProps as any)}
        />
      </li>
    ))}
  </ul>
);
