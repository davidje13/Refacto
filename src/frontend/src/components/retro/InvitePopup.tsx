import React, { memo } from 'react';
import QR from '../common/QR';
import WrappedButton from '../common/WrappedButton';
import './InvitePopup.less';

interface PropsT {
  onClose: () => void;
}

export default memo(({ onClose }: PropsT) => {
  const { protocol, host, pathname } = document.location;
  const url = `${protocol}//${host}${pathname}`;
  return (
    <div className="popup-invite">
      <p>Attendees can join on their computer or phone:</p>
      <p className="link">{url}</p>
      <QR className="qr-code" content={url} />
      <p className="dialog-options">
        <WrappedButton onClick={onClose} className="primary">
          Close
        </WrappedButton>
      </p>
    </div>
  );
});
