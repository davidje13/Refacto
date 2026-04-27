import { memo } from 'react';
import type { RetroItem } from '@refacto/shared/api-entities';
import { actionItemWithinRange } from '../../../../actions/moodRetro';
import { ItemColumn } from '../../../items/ItemColumn';
import { ActionItem } from './ActionItem';

interface PropsT {
  title: string;
  items: RetroItem[];
  group?: string | undefined;
  rangeFrom?: number;
  rangeTo?: number;
  onSetDone?: ((id: string, done: boolean) => void) | undefined;
  onEdit?: ((id: string, diff: Partial<RetroItem>) => void) | undefined;
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
        itemProps={{ onSetDone, onEdit, onDelete }}
      />
    </section>
  ),
);
