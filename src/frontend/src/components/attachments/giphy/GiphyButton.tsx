import React, { Fragment, useState, useCallback, memo } from 'react';
import type { RetroItemAttachment } from '../../../shared/api-entities';
import Popup from '../../common/Popup';
import WrappedButton from '../../common/WrappedButton';
import useBoundCallback from '../../../hooks/useBoundCallback';
import GiphyPopup from './GiphyPopup';

interface PropsT {
  defaultAttachment?: RetroItemAttachment | null;
  onChange: (attachment: RetroItemAttachment | null) => void;
}

export default memo(({ defaultAttachment = null, onChange }: PropsT) => {
  const [visible, setVisible] = useState(false);
  const show = useBoundCallback(setVisible, true);
  const hide = useBoundCallback(setVisible, false);
  const handleSave = useCallback(
    (newAttachment: RetroItemAttachment | null) => {
      hide();
      onChange(newAttachment);
    },
    [hide, onChange],
  );

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
    <Fragment>
      <WrappedButton
        key="giphy"
        title="Add GIPHY image"
        className="open-giphy"
        onClick={show}
      />
      <Popup data={popup} onClose={hide} />
    </Fragment>
  );
});
