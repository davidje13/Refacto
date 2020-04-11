import React, { useState, useCallback } from 'react';
import type { RetroItemAttachment } from 'refacto-entities';
import Popup from '../../common/Popup';
import WrappedButton from '../../common/WrappedButton';
import useBoundCallback from '../../../hooks/useBoundCallback';
import GiphyPopup from './GiphyPopup';

interface PropsT {
  defaultAttachment?: RetroItemAttachment | null;
  onChange: (attachment: RetroItemAttachment | null) => void;
}

const GiphyButton = ({ defaultAttachment, onChange }: PropsT): React.ReactElement => {
  const [visible, setVisible] = useState(false);
  const show = useBoundCallback(setVisible, true);
  const hide = useBoundCallback(setVisible, false);
  const handleSave = useCallback((newAttachment: RetroItemAttachment | null) => {
    hide();
    onChange(newAttachment);
  }, [hide, onChange]);

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
    <React.Fragment>
      <WrappedButton
        key="giphy"
        title="Add GIPHY image"
        className="open-giphy"
        onClick={show}
      />
      <Popup data={popup} onClose={hide} />
    </React.Fragment>
  );
};

export default React.memo(GiphyButton);
