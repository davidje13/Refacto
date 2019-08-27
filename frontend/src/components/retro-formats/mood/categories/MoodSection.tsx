import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { RetroItem, UserProvidedRetroItemDetails } from 'refacto-entities';
import FaceIcon from './FaceIcon';
import MoodItem from './MoodItem';
import ItemColumn from '../ItemColumn';
import ItemEditor from '../ItemEditor';
import useBoundCallback from '../../../../hooks/useBoundCallback';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../api/dataStructurePropTypes';

interface PropsT {
  category: string;
  categoryLabel: string;
  items: RetroItem[];
  theme: string;
  addItemPlaceholder: string;
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
  onSetDone?: (id: string, done: boolean) => void;
  onSwitchFocus?: (markPreviousDone: boolean, id: string | null) => void;
  onAddExtraTime?: (time: number) => void;
  focusedItemId: string | null;
  focusedItemTimeout: number;
  autoScroll: boolean;
}

const MoodSection = ({
  category,
  categoryLabel,
  theme,
  items,
  addItemPlaceholder,
  onAddItem,
  onVote,
  onEdit,
  onDelete,
  onSetDone,
  onSwitchFocus,
  onAddExtraTime,
  focusedItemId,
  focusedItemTimeout,
  autoScroll,
}: PropsT): React.ReactElement => {
  const handleAddItem = useBoundCallback(onAddItem, category);
  const handleItemSelect = useBoundCallback(onSwitchFocus, true);
  const handleItemCancel = useBoundCallback(onSwitchFocus, false, null);

  const handleItemDone = useCallback((id: string) => {
    onSetDone!(id, true);
    onSwitchFocus!(false, null);
  }, [onSwitchFocus, onSetDone]);

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
            clearAfterSubmit
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
          onSelect: handleItemSelect,
          onAddExtraTime,
          onCancel: handleItemCancel,
          onDone: onSwitchFocus && onSetDone && handleItemDone,
        }}
      />
    </section>
  );
};

MoodSection.propTypes = {
  category: PropTypes.string.isRequired,
  categoryLabel: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(propTypesShapeItem).isRequired,
  theme: PropTypes.string,
  addItemPlaceholder: PropTypes.string,
  onAddItem: PropTypes.func,
  onVote: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onSwitchFocus: PropTypes.func,
  onSetDone: PropTypes.func,
  onAddExtraTime: PropTypes.func,
  focusedItemId: PropTypes.string,
  focusedItemTimeout: PropTypes.number,
  autoScroll: PropTypes.bool,
};

MoodSection.defaultProps = {
  theme: '',
  addItemPlaceholder: '',
  onAddItem: undefined,
  onVote: undefined,
  onEdit: undefined,
  onDelete: undefined,
  onSwitchFocus: undefined,
  onSetDone: undefined,
  onAddExtraTime: undefined,
  focusedItemId: null,
  focusedItemTimeout: 0,
  autoScroll: false,
};

forbidExtraProps(MoodSection);

export default React.memo(MoodSection);
