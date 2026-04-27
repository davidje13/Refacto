import { memo } from 'react';
import type { RetroItem } from '@refacto/shared/api-entities';
import TickBold from '../../../../../resources/tick-bold.svg';
import { useOptionalBoundEvent } from '../../../../hooks/useBoundEvent';
import { ItemColumn } from '../../../items/ItemColumn';
import { ItemEditor } from '../../../items/ItemEditor';
import { FaceIcon, type MoodType } from './FaceIcon';
import { MoodItem } from './MoodItem';

interface PropsT {
  category: MoodType;
  categoryLabel: string;
  group?: string | undefined;
  items: RetroItem[];
  theme?: string;
  addItemPlaceholder?: string;
  onAddItem?:
    | ((
        category: string,
        group: string | undefined,
        itemParts: Partial<RetroItem>,
      ) => void)
    | undefined;
  onVote?: ((id: string) => void) | undefined;
  onEdit?: ((id: string, diff: Partial<RetroItem>) => void) | undefined;
  onDelete?: ((id: string) => void) | undefined;
  onSelect?: ((id: string) => void) | undefined;
  onCancel?: ((id: string) => void) | undefined;
  onClose?: ((id: string) => void) | undefined;
  onContinue?: ((id: string) => void) | undefined;
  onAddExtraTime?: ((time: number) => void) | undefined;
  focusedItemId?: string | null;
  focusedItemTimeout?: number;
  autoScroll?: boolean;
}

function itemFilter(group: string | undefined, category: string) {
  return (item: RetroItem): boolean =>
    item.category === category &&
    (!item.group || !group || item.group === group);
}

export const MoodSection = memo(
  ({
    category,
    categoryLabel,
    group,
    theme = '',
    items,
    addItemPlaceholder = '',
    onAddItem,
    onVote,
    onEdit,
    onDelete,
    onSelect,
    onCancel,
    onClose,
    onContinue,
    onAddExtraTime,
    focusedItemId = null,
    focusedItemTimeout = 0,
    autoScroll = false,
  }: PropsT) => {
    const handleAddItem = useOptionalBoundEvent(onAddItem, category, group);

    return (
      <section className={category}>
        <header>
          <h2 title={categoryLabel}>
            <FaceIcon theme={theme} type={category} />
          </h2>
          {handleAddItem && (
            <ItemEditor
              identifier={`new-item-${category}`}
              onSubmit={handleAddItem}
              submitButtonLabel={<TickBold aria-label="Post" role="img" />}
              submitButtonTitle="Add"
              placeholder={addItemPlaceholder}
              allowAttachments
              clearAfterSubmit
              blurOnCancel
            />
          )}
        </header>
        <ItemColumn
          items={items.filter(itemFilter(group, category))}
          ItemType={MoodItem}
          focusedItemId={focusedItemId}
          itemProps={{
            focusedItemTimeout,
            autoScroll,
            onVote,
            onEdit,
            onDelete,
            onSelect,
            onAddExtraTime,
            onCancel,
            onClose,
            onContinue,
          }}
        />
      </section>
    );
  },
);
