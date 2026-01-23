import { memo } from 'react';
import { QR } from '../common/QR';
import { Popup } from '../common/Popup';
import './InvitePopup.css';

interface PropsT {
  isOpen: boolean;
  onClose: () => void;
}

export const InvitePopup = memo(({ isOpen, onClose }: PropsT) => {
  const { protocol, host, pathname } = document.location;
  const url = `${protocol}//${host}${pathname}`;
  return (
    <Popup
      title="Invite"
      hideTitle
      isOpen={isOpen}
      keys={{ Enter: onClose, Escape: onClose }}
      onClose={onClose}
    >
      <div className="popup-invite">
        <p>Attendees can join on their computer or phone:</p>
        <p className="link">{url}</p>
        <QR className="qr-code" content={url} />
        <section className="dialog-options">
          <button
            type="button"
            className="global-button primary"
            onClick={onClose}
          >
            Close
          </button>
        </section>
      </div>
    </Popup>
  );
});
