import type { FunctionComponent } from 'react';
import { useLocation } from 'wouter';
import { useTimeInterval } from 'react-hook-final-countdown';
import type { Retro, RetroAuth } from '../../shared/api-entities';
import { retroService } from '../../api/api';
import { useSubmissionCallback } from '../../hooks/useSubmissionCallback';
import { formatDurationLong } from '../../time/formatters';
import { Alert } from '../common/Alert';
import { Popup } from '../common/Popup';
import { ApiDownloadButton } from '../common/ApiDownloadButton';
import './ScheduledDeleteOverlay.css';

interface PropsT {
  retro: Retro;
  retroAuth: RetroAuth;
}

export const ScheduledDeleteOverlay: FunctionComponent<PropsT> = ({
  retro,
  retroAuth,
}) => {
  const [_, setLocation] = useLocation();
  const now = useTimeInterval(60 * 1000, retro.scheduledDelete);
  const remaining = retro.scheduledDelete - now;

  const [performCancel, sending, error] = useSubmissionCallback(() =>
    retroService.cancelDelete(retro.id, retroAuth.retroToken),
  );

  return (
    <Popup isOpen title="Retro Scheduled for Deletion" onClose={null}>
      <div className="popup-scheduled-delete">
        {remaining > 0 ? (
          <>
            <p>
              This retro is scheduled for deletion
              {remaining > 2 * 60 * 1000
                ? ` in approximately ${formatDurationLong(remaining)}.`
                : ' soon.'}
            </p>
            {!retroAuth.scopes.includes('manage') ? (
              <p>Users with management permission can cancel this deletion.</p>
            ) : null}
          </>
        ) : remaining > -60 * 1000 ? (
          <p>This retro is being deleted.</p>
        ) : (
          <p>This retro has been deleted.</p>
        )}
        <section className="dialog-options">
          <button
            type="button"
            className="global-button"
            onClick={() => setLocation('/')}
            disabled={sending}
          >
            Home
          </button>
          {remaining > 0 ? (
            <ApiDownloadButton
              url={`retros/${encodeURIComponent(retro.id)}/export/json`}
              retroAuth={retroAuth}
              filename={`${retro.slug}-export.json`}
            >
              Download Backup
            </ApiDownloadButton>
          ) : null}
          {retroAuth.scopes.includes('manage') && remaining > 0 ? (
            <button
              type="button"
              className="global-button"
              onClick={performCancel}
              disabled={sending}
            >
              Cancel Deletion
            </button>
          ) : null}
        </section>
        <Alert message={error} />
      </div>
    </Popup>
  );
};
