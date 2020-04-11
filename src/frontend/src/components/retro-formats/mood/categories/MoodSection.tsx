import React, { memo } from 'react';
import type { RetroItem, UserProvidedRetroItemDetails } from 'refacto-entities';
import FaceIcon from './FaceIcon';
import MoodItem from './MoodItem';
import ItemColumn from '../ItemColumn';
import ItemEditor from '../ItemEditor';
import useBoundCallback from '../../../../hooks/useBoundCallback';

interface PropsT {
  category: string;
  categoryLabel: string;
  items: RetroItem[];
  theme?: string;
  addItemPlaceholder?: string;
  onAddItem?: (
    category: string,
    itemParts: Partial<UserProvidedRetroItemDetails>,
  ) => void;
  onVote?: (id: string) => void;
  onEdit?: (
    id: string,
    diff: Partial<UserProvidedRetroItemDetails>,
  ) => void;
  onDelete?: (id: string) => void;
  onSelect?: (id: string) => void;
  onCancel?: (id: string) => void;
  onContinue?: (id: string) => void;
  onSetDone?: (id: string, done: boolean) => void;
  onSwitchFocus?: (markPreviousDone: boolean, id: string | null) => void;
  onAddExtraTime?: (time: number) => void;
  focusedItemId?: string | null;
  focusedItemTimeout?: number;
  autoScroll?: boolean;
}

export default memo(({
  category,
  categoryLabel,
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
  const handleAddItem = useBoundCallback(onAddItem, category);

  return (
    <section className={category}>
      <header>
        <h2 title={categoryLabel}>
          <FaceIcon theme={theme} type={category} />
        </h2>
        { handleAddItem && (
          <ItemEditor
            onSubmit={handleAddItem}
            submitButtonTitle="Add"
            placeholder={addItemPlaceholder}
            allowAttachments
            clearAfterSubmit
            blurOnCancel
          />
        ) }
      </header>
      <ItemColumn<React.ComponentPropsWithRef<typeof MoodItem>>
        items={items.filter((item) => (item.category === category))}
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
});
