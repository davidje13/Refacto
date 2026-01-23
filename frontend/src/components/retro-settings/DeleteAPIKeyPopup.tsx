import { memo, useEffect } from 'react';
import type { Retro, RetroApiKey } from '../../shared/api-entities';
import { useSubmissionCallback } from '../../hooks/useSubmissionCallback';
import { retroApiKeyService } from '../../api/api';
import { Popup } from '../common/Popup';
import { Alert } from '../common/Alert';
import './DeleteAPIKeyPopup.css';

interface PropsT {
  retro: Retro;
  retroToken: string;
  apiKey: RetroApiKey | null;
  onDelete: () => void;
  onClose: () => void;
}

export const DeleteAPIKeyPopup = memo(
  ({ retro, retroToken, apiKey, onDelete, onClose }: PropsT) => {
    const [performDelete, sending, error, resetError] = useSubmissionCallback(
      async () => {
        if (!apiKey) {
          return;
        }
        await retroApiKeyService.revoke(retro.id, apiKey.id, retroToken);
        onDelete();
        onClose();
      },
    );

    useEffect(() => {
      if (apiKey !== null) {
        resetError();
      }
    }, [apiKey]);

    return (
      <Popup
        isOpen={apiKey !== null}
        title="Delete API Key?"
        keys={{ Escape: onClose }}
        onClose={onClose}
      >
        <div className="popup-delete-api-key">
          <p>
            Are you sure you want to delete the API Key &ldquo;
            <bdi>{apiKey?.name}</bdi>
            &rdquo;? This will immediately revoke access for any services using
            the key, and cannot be undone.
          </p>
          <section className="dialog-options">
            <button type="button" className="global-button" onClick={onClose}>
              Cancel
            </button>
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
    );
  },
);
