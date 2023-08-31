import { memo } from 'react';
import {
  type RetroItem,
  type UserProvidedRetroItemDetails,
} from '../../../../shared/api-entities';
import { ActionItem } from './ActionItem';
import { ItemColumn } from '../ItemColumn';

function actionItemWithinRange(
  group: string | undefined,
  from: number,
  to: number,
) {
  return (item: RetroItem): boolean =>
    item.category === 'action' &&
    (!group || !item.group || item.group === group) &&
    item.created >= from &&
    item.created < to;
}

interface PropsT {
  title: string;
  items: RetroItem[];
  group?: string | undefined;
  rangeFrom?: number;
  rangeTo?: number;
  onSetDone?: ((id: string, done: boolean) => void) | undefined;
  onEdit?:
    | ((id: string, diff: Partial<UserProvidedRetroItemDetails>) => void)
    | undefined;
  onDelete?: ((id: string) => void) | undefined;
}

export const ActionSection = memo(
  ({
    title,
    items,
    group,
    rangeFrom = Number.NEGATIVE_INFINITY,
    rangeTo = Number.POSITIVE_INFINITY,
    onSetDone,
    onEdit,
    onDelete,
  }: PropsT) => (
    <section>
      <header>
        <h3>{title}</h3>
      </header>
      <ItemColumn
        items={items.filter(actionItemWithinRange(group, rangeFrom, rangeTo))}
        ItemType={ActionItem}
        itemProps={{
          onSetDone,
          onEdit,
          onDelete,
        }}
      />
    </section>
  ),
);
