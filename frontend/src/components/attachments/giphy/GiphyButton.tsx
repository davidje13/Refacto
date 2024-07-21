import { useState, memo } from 'react';
import { type RetroItemAttachment } from '../../../shared/api-entities';
import { useEvent } from '../../../hooks/useEvent';
import { Popup } from '../../common/Popup';
import { WrappedButton } from '../../common/WrappedButton';
import { GiphyPopup } from './GiphyPopup';

interface PropsT {
  defaultAttachment?: RetroItemAttachment | null;
  onChange: (attachment: RetroItemAttachment | null) => void;
}

export const GiphyButton = memo(
  ({ defaultAttachment = null, onChange }: PropsT) => {
    const [visible, setVisible] = useState(false);
    const show = useEvent(() => setVisible(true));
    const hide = useEvent(() => setVisible(false));
    const handleSave = useEvent((newAttachment: RetroItemAttachment | null) => {
      hide();
      onChange(newAttachment);
    });

    let popup = null;
    if (visible) {
      popup = {
        title: 'Insert Giphy Image',
        content: (
          <GiphyPopup
            defaultAttachment={defaultAttachment}
            onConfirm={handleSave}
            onCancel={hide}
          />
        ),
        keys: {
          Escape: hide,
        },
      };
    }

    return (
      <>
        <WrappedButton
          key="giphy"
          title="Add GIPHY image"
          className="open-giphy"
          onClick={show}
        />
        <Popup data={popup} onClose={hide} />
      </>
    );
  },
);
