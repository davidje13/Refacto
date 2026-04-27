import { memo } from 'react';
import type { RetroItem } from '@refacto/shared/api-entities';
import { itemWithCategory } from '../../../../actions/retro';
import { ItemColumn } from '../../../items/ItemColumn';
import { LessonItem } from './LessonItem';
import { AddLesson } from './AddLesson';
import './LessonsPane.css';

interface PropsT {
  items: RetroItem[];
  group?: string | undefined;
  onAddItem?:
    | ((group: string | undefined, itemParts: Partial<RetroItem>) => void)
    | undefined;
  onEdit?: ((id: string, diff: Partial<RetroItem>) => void) | undefined;
  onDelete?: ((id: string) => void) | undefined;
}

export const LessonsPane = memo(
  ({ items, group, onAddItem, onEdit, onDelete }: PropsT) => (
    <section className="lessons">
      <div className="content">
        {onAddItem && <AddLesson onAddItem={onAddItem} />}
        <ItemColumn
          items={items.filter(itemWithCategory(group, 'lesson'))}
          ItemType={LessonItem}
          itemProps={{ onEdit, onDelete }}
        />
      </div>
    </section>
  ),
);
