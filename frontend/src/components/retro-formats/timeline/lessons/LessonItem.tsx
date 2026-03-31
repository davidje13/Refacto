import { memo } from 'react';
import TickBold from '../../../../../resources/tick-bold.svg';
import type { RetroItem } from '../../../../shared/api-entities';
import { useEvent } from '../../../../hooks/useEvent';
import { useOptionalBoundEvent } from '../../../../hooks/useBoundEvent';
import { useBoolean } from '../../../../hooks/useBoolean';
import { ItemEditor } from '../../../items/ItemEditor';
import './LessonItem.css';

interface PropsT {
  item: RetroItem;
  onEdit?: ((id: string, diff: Partial<RetroItem>) => void) | undefined;
  onDelete?: ((id: string) => void) | undefined;
}

export const LessonItem = memo(({ item, onEdit, onDelete }: PropsT) => {
  const handleDelete = useOptionalBoundEvent(onDelete, item.id);

  const editing = useBoolean(false);
  const handleSaveEdit = useEvent((diff: Partial<RetroItem>) => {
    editing.setFalse();
    onEdit!(item.id, diff);
  });

  if (editing.value) {
    return (
      <div className="lesson-item editing">
        <ItemEditor
          defaultItem={item}
          submitButtonLabel={
            <>
              <TickBold role="presentation" /> Save
            </>
          }
          submitButtonTitle="Save changes"
          onSubmit={handleSaveEdit}
          onDelete={onDelete ? handleDelete : undefined}
          onCancel={editing.setFalse}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="lesson-item">
      <div className="message">{item.message}</div>
      {onEdit && (
        <button
          type="button"
          title="Edit"
          className="edit"
          onClick={editing.setTrue}
        />
      )}
    </div>
  );
});
