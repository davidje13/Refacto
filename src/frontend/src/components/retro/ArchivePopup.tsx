import React, { memo } from 'react';
import WrappedButton from '../common/WrappedButton';
import './ArchivePopup.less';

interface PropsT {
  onConfirm: () => void;
  onCancel: () => void;
}

export default memo(({
  onConfirm,
  onCancel,
}: PropsT) => (
  <div className="popup-archive">
    <p>Archive and clear this retro?</p>
    <p>
      <WrappedButton onClick={onCancel}>
        Cancel
      </WrappedButton>
      <WrappedButton onClick={onConfirm} className="primary">
        Archive
      </WrappedButton>
    </p>
  </div>
));
