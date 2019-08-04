import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { RetroItem } from 'refacto-entities';
import FaceIcon from './FaceIcon';
import MoodItem from './MoodItem';
import ItemColumn from '../ItemColumn';
import ExpandingTextEntry from '../../../common/ExpandingTextEntry';
import useBoundCallback from '../../../../hooks/useBoundCallback';
import forbidExtraProps from '../../../../helpers/forbidExtraProps';
import { propTypesShapeItem } from '../../../../api/dataStructurePropTypes';

interface PropsT {
  category: string;
  categoryLabel: string;
  items: RetroItem[];
  addItemPlaceholder: string;
  onAddItem?: (category: string, message: string) => void;
  onVote?: (id: string) => void;
  onEdit?: (id: string, message: string) => void;
  onDelete?: (id: string) => void;
  onSetDone?: (id: string, done: boolean) => void;
  onSwitchFocus?: (id: string | null, markPreviousDone: boolean) => void;
  onAddExtraTime?: (time: number) => void;
  focusedItemId: string | null;
  focusedItemTimeout: number;
}

const MoodSection = ({
  category,
  categoryLabel,
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
}: PropsT): React.ReactElement => {
  const handleAddItem = useBoundCallback(onAddItem, category);

  const handleItemSelect = useCallback((id: string) => {
    onSwitchFocus!(id, true);
  }, [onSwitchFocus]);

  const handleItemCancel = useCallback((id: string) => {
    // TODO TypeScript#16
    if (onSetDone) {
      onSetDone(id, false);
    }
    onSwitchFocus!(null, false);
  }, [onSwitchFocus, onSetDone]);

  const handleItemDone = useCallback((id: string) => {
    onSetDone!(id, true);
    onSwitchFocus!(null, false);
  }, [onSwitchFocus, onSetDone]);

  return (
    <section className={category}>
      <header>
        <h2 title={categoryLabel}><FaceIcon type={category} /></h2>
        { handleAddItem && (
          <ExpandingTextEntry
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
          onVote,
          onEdit,
          onDelete,
          onSelect: onSwitchFocus && handleItemSelect,
          onAddExtraTime,
          onCancel: onSwitchFocus && handleItemCancel,
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
};

MoodSection.defaultProps = {
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
};

forbidExtraProps(MoodSection);

export default React.memo(MoodSection);
