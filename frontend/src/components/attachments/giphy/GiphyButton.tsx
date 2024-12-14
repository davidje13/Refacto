import { memo } from 'react';
import { type RetroItemAttachment } from '../../../shared/api-entities';
import { useEvent } from '../../../hooks/useEvent';
import { useBoolean } from '../../../hooks/useBoolean';
import { Popup } from '../../common/Popup';
import { WrappedButton } from '../../common/WrappedButton';
import { GiphyPopup } from './GiphyPopup';

interface PropsT {
  defaultAttachment?: RetroItemAttachment | null;
  onChange: (attachment: RetroItemAttachment | null) => void;
}

export const GiphyButton = memo(
  ({ defaultAttachment = null, onChange }: PropsT) => {
    const visible = useBoolean(false);
    const handleSave = useEvent((newAttachment: RetroItemAttachment | null) => {
      visible.setFalse();
      onChange(newAttachment);
    });

    return (
      <>
        <WrappedButton
          key="giphy"
          title="Add GIPHY image"
          className="open-giphy"
          onClick={visible.setTrue}
        />
        <Popup
          title="Insert Giphy Image"
          keys={{ Escape: visible.setFalse }}
          isOpen={visible.value}
          onClose={visible.setFalse}
        >
          <GiphyPopup
            defaultAttachment={defaultAttachment}
            onConfirm={handleSave}
            onCancel={visible.setFalse}
          />
        </Popup>
      </>
    );
  },
);
