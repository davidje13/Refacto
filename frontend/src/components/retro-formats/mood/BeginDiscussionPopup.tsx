import { memo } from 'react';
import { Popup } from '../../common/Popup';
import './BeginDiscussionPopup.css';

interface PropsT {
  isOpen: boolean;
  hasPastActions: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const BeginDiscussionPopup = memo(
  ({ isOpen, hasPastActions, onConfirm, onClose }: PropsT) => (
    <Popup
      title="Start discussion?"
      isOpen={isOpen}
      keys={{ Enter: onConfirm, Escape: onClose }}
      onClose={onClose}
    >
      <div className="popup-begin">
        <p>
          You have selected an item. This will start the discussion for all
          participants; are you ready to begin?
        </p>
        <p>
          (if you selected the item by accident, press &ldquo;Cancel&rdquo; to
          return to adding items and voting)
        </p>
        {hasPastActions ? (
          <p className="reminder">
            Reminder: you have incomplete action items from a previous retro. It
            is usually best to review these before discussing new topics.
          </p>
        ) : null}
        <section className="dialog-options">
          <button type="button" className="global-button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="global-button primary"
            onClick={onConfirm}
          >
            Begin
          </button>
        </section>
      </div>
    </Popup>
  ),
);
