import { memo, useEffect, useState } from 'react';
import type { Retro } from '../../shared/api-entities';
import { Popup } from '../common/Popup';
import { Alert } from '../common/Alert';
import { realAutoFocus } from '../../helpers/realAutoFocus';
import { useSubmissionCallback } from '../../hooks/useSubmissionCallback';
import { retroService } from '../../api/api';
import './ArchivePopup.css';

interface PropsT {
  retroToken: string;
  retro: Retro;
  isOpen: boolean;
  onClose: () => void;
}

export const ArchivePopup = memo(
  ({ retroToken, retro, isOpen, onClose }: PropsT) => {
    const [preserveRemaining, setPreserveRemaining] = useState(false);
    const [performArchive, sending, error, resetError] = useSubmissionCallback(
      async () => {
        await retroService.archive(retro.id, retroToken, preserveRemaining);
        onClose();
      },
    );

    useEffect(() => {
      if (isOpen) {
        resetError();
      }
    }, [isOpen]);

    const hasRemainingItems =
      retro.format === 'mood' &&
      retro.items.some((item) => item.category !== 'action' && !item.doneTime);

    return (
      <Popup
        title={
          hasRemainingItems
            ? 'Create Archive'
            : 'Retro Complete! Create Archive?'
        }
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
            <label className="checkbox">
              <input
                type="checkbox"
                checked={preserveRemaining}
                onChange={(e) => setPreserveRemaining(e.currentTarget.checked)}
                autoComplete="off"
              />
              Keep unticked items for next retro
            </label>
          ) : null}
          <section className="dialog-options">
            <button type="button" className="global-button" onClick={onClose}>
              Cancel
            </button>
            <button
              ref={realAutoFocus}
              type="submit"
              className="global-button primary"
              disabled={sending}
            >
              Archive
            </button>
            <Alert message={error} />
          </section>
        </form>
      </Popup>
    );
  },
);
