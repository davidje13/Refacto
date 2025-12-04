import { memo } from 'react';
import type {
  RetroItem,
  UserProvidedRetroItemDetails,
} from '../../../../shared/api-entities';
import { FaceIcon } from './FaceIcon';
import { MoodItem } from './MoodItem';
import { ItemColumn } from '../ItemColumn';
import { ItemEditor } from '../ItemEditor';
import { useEvent } from '../../../../hooks/useEvent';
import TickBold from '../../../../../resources/tick-bold.svg';

interface PropsT {
  category: string;
  categoryLabel: string;
  group?: string | undefined;
  items: RetroItem[];
  theme?: string;
  addItemPlaceholder?: string;
  onAddItem?:
    | ((
        category: string,
        group: string | undefined,
        itemParts: Partial<UserProvidedRetroItemDetails>,
      ) => void)
    | undefined;
  onVote?: ((id: string) => void) | undefined;
  onEdit?:
    | ((id: string, diff: Partial<UserProvidedRetroItemDetails>) => void)
    | undefined;
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
    const handleAddItem = useEvent(
      (itemParts: Partial<UserProvidedRetroItemDetails>) =>
        onAddItem?.(category, group, itemParts),
    );

    return (
      <section className={category}>
        <header>
          <h2 title={categoryLabel}>
            <FaceIcon theme={theme} type={category} />
          </h2>
          {onAddItem && (
            <ItemEditor
              identifier={`new-item-${category}`}
              onSubmit={handleAddItem}
              submitButtonLabel={<TickBold />}
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
