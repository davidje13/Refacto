import { memo, useEffect, useState } from 'react';
import type { Retro } from '../../shared/api-entities';
import { useSubmissionCallback } from '../../hooks/useSubmissionCallback';
import { realAutoFocus } from '../../helpers/realAutoFocus';
import { retroApiKeyService } from '../../api/api';
import { Popup } from '../common/Popup';
import { Alert } from '../common/Alert';
import './CreateReadonlyUrlPopup.css';

interface PropsT {
  retro: Retro;
  retroToken: string;
  isOpen: boolean;
  onSave: () => void;
  onClose: () => void;
}

const DEFAULT_NAME = 'Read-Only Link';

export const CreateReadonlyUrlPopup = memo(
  ({ retro, retroToken, isOpen, onSave, onClose }: PropsT) => {
    const { protocol, host } = document.location;
    const [url, setURL] = useState('');
    const [name, setName] = useState(DEFAULT_NAME);
    const [performCreate, sending, error, resetError] = useSubmissionCallback(
      async () => {
        const created = await retroApiKeyService.create({
          retro,
          retroToken,
          name,
          scopes: ['read'],
        });
        setURL(`${protocol}//${host}/watch/${retro.id}#${created.key}`);
        onSave();
      },
    );

    useEffect(() => {
      if (isOpen) {
        setURL('');
        setName(DEFAULT_NAME);
        resetError();
      }
    }, [isOpen]);

    return (
      <Popup
        title="New Read-Only URL"
        isOpen={isOpen}
        keys={{ Enter: url ? onClose : performCreate, Escape: onClose }}
        onClose={onClose}
      >
        {url ? (
          <div className="popup-add-readonly-url">
            <p>
              URL created. Make a note of this; it will not be possible to read
              it again.
            </p>
            <p className="url-output">
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
            </p>
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
        ) : (
          <form
            className="global-form popup-add-readonly-url"
            onSubmit={performCreate}
          >
            <p>
              Read-only URLs can be used to display live retros on shared
              devices, such as a smart TV or a meeting room computer. You can
              create multiple read-only URLs at once, and revoke any URL at any
              time.
            </p>
            <label>
              Reference Name (this does not appear in the URL)
              <input
                ref={realAutoFocus}
                name="api-key-name"
                type="text"
                placeholder="URL name"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                autoComplete="off"
                required
              />
            </label>
            <section className="dialog-options">
              <button type="button" className="global-button" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="global-button primary"
                disabled={sending}
              >
                Create
              </button>
              <Alert message={error} />
            </section>
          </form>
        )}
      </Popup>
    );
  },
);
