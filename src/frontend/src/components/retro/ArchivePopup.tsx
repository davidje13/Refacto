import React from 'react';
import WrappedButton from '../common/WrappedButton';
import './ArchivePopup.less';

interface PropsT {
  onConfirm: () => void;
  onCancel: () => void;
}

const ArchivePopup = ({ onConfirm, onCancel }: PropsT): React.ReactElement => (
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
);

export default React.memo(ArchivePopup);
