import type { FunctionComponent } from 'react';
import TickBold from '../../../../../resources/tick-bold.svg';
import { useBoundEvent } from '../../../../hooks/useBoundEvent';
import { useTypingEvent } from '../../../../hooks/useTypingEvent';
import type { RetroItem } from '../../../../shared/api-entities';
import { classNames } from '../../../../helpers/classNames';
import { TypingIndicator } from '../../../common/TypingIndicator';
import { ItemEditor } from '../../../items/ItemEditor';
import './AddLesson.css';

interface PropsT {
  group?: string | undefined;
  onAddItem: (group: string | undefined, itemParts: Partial<RetroItem>) => void;
  narrow?: boolean;
}

export const AddLesson: FunctionComponent<PropsT> = ({
  group,
  onAddItem,
  narrow = false,
}) => {
  const handleAddItem = useBoundEvent(onAddItem, group);
  const typing = useTypingEvent(`action${group ? `-${group}` : ''}:`);

  return (
    <div className={classNames('add-lesson', { narrow })}>
      <ItemEditor
        identifier="new-lesson"
        onSubmit={handleAddItem}
        onChange={typing.onChange}
        submitButtonLabel={<TickBold aria-label="Save lesson" role="img" />}
        submitButtonTitle="Add"
        placeholder="Record a lesson learned"
        clearAfterSubmit
        blurOnSubmit
        blurOnCancel
      />
      <TypingIndicator other={typing.other} me={typing.me} />
    </div>
  );
};
