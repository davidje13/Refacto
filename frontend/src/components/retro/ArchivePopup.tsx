import { memo } from 'react';
import { WrappedButton } from '../common/WrappedButton';
import './ArchivePopup.less';

interface PropsT {
  onConfirm: () => void;
  onCancel: () => void;
}

export const ArchivePopup = memo(({ onConfirm, onCancel }: PropsT) => (
  <div className="popup-archive">
    <p>Archive and clear this retro?</p>
    <p className="dialog-options">
      <WrappedButton onClick={onCancel}>Cancel</WrappedButton>
      <WrappedButton onClick={onConfirm} className="primary">
        Archive
      </WrappedButton>
    </p>
  </div>
));
