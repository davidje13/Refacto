import { memo, useEffect, useState } from 'react';
import type { Retro } from '../../shared/api-entities';
import { Popup } from '../common/Popup';
import { Alert } from '../common/Alert';
import { useSubmissionCallback } from '../../hooks/useSubmissionCallback';
import { archiveService } from '../../api/api';
import type { RetroDispatch } from '../../api/RetroTracker';
import { clearCovered } from '../../actions/retro';
import './ArchivePopup.less';

interface PropsT {
  retroToken: string;
  retro: Retro;
  retroDispatch: RetroDispatch;
  isOpen: boolean;
  onClose: () => void;
}

export const ArchivePopup = memo(
  ({ retroToken, retro, retroDispatch, isOpen, onClose }: PropsT) => {
    const [preserveRemaining, setPreserveRemaining] = useState(false);
    const [performArchive, sending, error, resetError] = useSubmissionCallback(
      async () => {
        await archiveService.create({ retro, retroToken });
        retroDispatch?.(clearCovered(preserveRemaining));
        onClose();
      },
    );

    useEffect(() => {
      if (isOpen) {
        resetError();
      }
    }, [isOpen]);

    const hasRemainingItems = retro.items.some(
      (item) => item.category !== 'action' && !item.doneTime,
    );

    return (
      <Popup
        title="Create Archive"
        isOpen={isOpen}
        keys={{ Enter: performArchive, Escape: onClose }}
        onClose={onClose}
      >
        <form className="global-form popup-archive" onSubmit={performArchive}>
          <p>
            Archiving creates a read-only copy of the current retro (viewable in
            the &ldquo;Archives&rdquo; section) and clears the retro board.
            Incomplete actions will remain.
          </p>
          {hasRemainingItems ? (
            <label>
              <input
                type="checkbox"
                checked={preserveRemaining}
                onChange={(e) => setPreserveRemaining(e.currentTarget.checked)}
                autoComplete="off"
              />
              Keep unticked items for next retro
            </label>
          ) : null}
          <p className="dialog-options">
            <button type="button" className="global-button" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="global-button primary"
              disabled={sending}
            >
              Archive
            </button>
            <Alert message={error} />
          </p>
        </form>
      </Popup>
    );
  },
);
