import React, { memo } from 'react';
import type {
  RetroItem,
  UserProvidedRetroItemDetails,
} from '../../../../shared/api-entities';
import FaceIcon from './FaceIcon';
import MoodItem from './MoodItem';
import ItemColumn from '../ItemColumn';
import ItemEditor from '../ItemEditor';
import useBoundCallback from '../../../../hooks/useBoundCallback';
import TickBold from '../../../../../resources/tick-bold.svg';

interface PropsT {
  category: string;
  categoryLabel: string;
  group?: string;
  items: RetroItem[];
  theme?: string;
  addItemPlaceholder?: string;
  onAddItem?: (
    category: string,
    group: string | undefined,
    itemParts: Partial<UserProvidedRetroItemDetails>,
  ) => void;
  onVote?: (id: string) => void;
  onEdit?: (id: string, diff: Partial<UserProvidedRetroItemDetails>) => void;
  onDelete?: (id: string) => void;
  onSelect?: (id: string) => void;
  onCancel?: (id: string) => void;
  onContinue?: (id: string) => void;
  onAddExtraTime?: (time: number) => void;
  focusedItemId?: string | null;
  focusedItemTimeout?: number;
  autoScroll?: boolean;
}

function itemFilter(group: string | undefined, category: string) {
  return (item: RetroItem): boolean =>
    item.category === category &&
    (!item.group || !group || item.group === group);
}

export default memo(
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
    onContinue,
    onAddExtraTime,
    focusedItemId,
    focusedItemTimeout = 0,
    autoScroll = false,
  }: PropsT) => {
    const handleAddItem = useBoundCallback(onAddItem, category, group);

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
            onContinue,
          }}
        />
      </section>
    );
  },
);
