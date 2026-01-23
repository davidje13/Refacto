import { memo, useEffect, useState } from 'react';
import type { Retro } from '../../shared/api-entities';
import { useSubmissionCallback } from '../../hooks/useSubmissionCallback';
import { retroApiKeyService } from '../../api/api';
import { Popup } from '../common/Popup';
import { Alert } from '../common/Alert';
import './CreateAPIKeyPopup.css';

interface PropsT {
  retro: Retro;
  retroToken: string;
  isOpen: boolean;
  onSave: () => void;
  onClose: () => void;
}

export const CreateAPIKeyPopup = memo(
  ({ retro, retroToken, isOpen, onSave, onClose }: PropsT) => {
    const [key, setKey] = useState('');
    const [name, setName] = useState('');
    const [scopes, setScopes] = useState<string[]>([]);
    const [performCreate, sending, error, resetError] = useSubmissionCallback(
      async () => {
        if (!scopes.length) {
          throw new Error('Must select at least one scope');
        }
        const created = await retroApiKeyService.create({
          retro,
          retroToken,
          name,
          scopes,
        });
        setKey(created.key);
        onSave();
      },
    );

    useEffect(() => {
      if (isOpen) {
        setKey('');
        setName('');
        setScopes([]);
        resetError();
      }
    }, [isOpen]);

    return (
      <Popup
        title="New API Key"
        isOpen={isOpen}
        keys={{ Enter: key ? onClose : performCreate, Escape: onClose }}
        onClose={onClose}
      >
        {key ? (
          <div className="popup-add-api-key">
            <p>
              API Key created. Make a note of this value; it will not be
              possible to read it again.
            </p>
            <p>
              <code>{key}</code>
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
            className="global-form popup-add-api-key"
            onSubmit={performCreate}
          >
            <label>
              API Key Name
              <input
                name="api-key-name"
                type="text"
                placeholder="key name"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                autoComplete="off"
                required
              />
            </label>
            {SCOPES.map(({ id, description }) => (
              <label key={id} className="checkbox">
                <input
                  type="checkbox"
                  checked={scopes.includes(id)}
                  onChange={(e) => {
                    if (e.currentTarget.checked) {
                      setScopes((s) => [...s, id]);
                    } else {
                      setScopes((s) => s.filter((v) => v !== id));
                    }
                  }}
                />
                <strong className="scope-id">{id}</strong> {description}
              </label>
            ))}
            <section className="dialog-options">
              <button type="button" className="global-button" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="global-button primary"
                disabled={sending}
              >
                Add
              </button>
              <Alert message={error} />
            </section>
          </form>
        )}
      </Popup>
    );
  },
);

const SCOPES = [
  { id: 'read', description: <>Read the retro contents.</> },
  {
    id: 'write',
    description: (
      <>
        Modify the retro contents (add, edit, delete), edit retro settings (e.g.
        theme), create archives.
      </>
    ),
  },
  { id: 'readArchives', description: <>Read the retro archives.</> },
  { id: 'manage', description: <>Edit the retro password and API keys.</> },
];
