import { useEffect, useState, type FunctionComponent } from 'react';
import type { Retro, RetroAuth } from '../../shared/api-entities';
import { useConfig } from '../../hooks/data/useConfig';
import { useSubmissionCallback } from '../../hooks/useSubmissionCallback';
import { realAutoFocus } from '../../helpers/realAutoFocus';
import { formatDurationLong } from '../../time/formatters';
import { retroService } from '../../api/api';
import { ApiDownloadButton } from '../common/ApiDownloadButton';
import { Popup } from '../common/Popup';
import { Alert } from '../common/Alert';
import './DeleteRetroButton.css';

interface PropsT {
  retro: Retro;
  retroAuth: RetroAuth;
}

export const DeleteRetroButton: FunctionComponent<PropsT> = ({
  retro,
  retroAuth,
}) => {
  const config = useConfig();
  const [deleting, setDeleting] = useState(false);
  const [performDelete, sending, error, resetError] = useSubmissionCallback(
    async () => {
      await retroService.scheduleDelete(retro.id, retroAuth.retroToken);
      setDeleting(false);
    },
  );

  const delay = config?.deleteRetroDelay ?? 0;

  useEffect(() => {
    if (deleting) {
      resetError();
    }
  }, [deleting]);

  if (delay < 0) {
    return <p>Retro deletion is not available.</p>;
  }

  return (
    <>
      <p>
        {delay > 0 ? (
          <>
            You can schedule this retro for deletion in{' '}
            {formatDurationLong(delay)}. Deletion can be cancelled at any time
            during this window by a user with management permissions.
          </>
        ) : (
          <>You can delete this retro immediately.</>
        )}{' '}
        Once deleted, the retro and all its archives cannot be recovered.
      </p>
      <p className="delete-retro-options">
        <ApiDownloadButton
          url={`retros/${encodeURIComponent(retro.id)}/export/json`}
          retroAuth={retroAuth}
          filename={`${retro.slug}-export.json`}
        >
          Download Backup
        </ApiDownloadButton>
        <button
          type="button"
          className="global-button destructive"
          onClick={() => setDeleting(true)}
        >
          Delete Retro
        </button>
      </p>
      <Popup
        isOpen={deleting}
        title="Delete Retro?"
        keys={{ Escape: () => setDeleting(false) }}
        onClose={() => setDeleting(false)}
      >
        <div className="popup-delete-retro">
          <p>Are you sure you want to delete this retro?</p>
          {delay > 0 ? (
            <p>
              This will begin a{' '}
              <strong>{formatDurationLong(delay, true)}</strong> countdown which
              can be cancelled by any user with management permissions. Once the
              countdown completes, the retro and all its archives will be
              deleted <strong>irrecoverably</strong>.
            </p>
          ) : (
            <p>
              This will delete the retro <strong>immediately</strong>
              {' and '}
              <strong>irrecoverably</strong>.
            </p>
          )}
          <p>You should download a backup of this retro before deleting it.</p>
          <section className="dialog-options">
            <button
              ref={realAutoFocus}
              type="button"
              className="global-button"
              onClick={() => setDeleting(false)}
            >
              Cancel
            </button>
            <ApiDownloadButton
              url={`retros/${encodeURIComponent(retro.id)}/export/json`}
              retroAuth={retroAuth}
              filename={`${retro.slug}-export.json`}
            >
              Download Backup
            </ApiDownloadButton>
            <button
              type="button"
              className="global-button destructive"
              onClick={performDelete}
              disabled={sending}
            >
              Delete
            </button>
            <Alert message={error} />
          </section>
        </div>
      </Popup>
    </>
  );
};
