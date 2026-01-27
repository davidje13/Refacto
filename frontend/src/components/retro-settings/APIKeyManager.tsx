import { memo, useState } from 'react';
import useAwaited from 'react-hook-awaited';
import Delete from '../../../resources/delete.svg';
import type { Retro, RetroApiKey, RetroAuth } from '../../shared/api-entities';
import { retroApiKeyService } from '../../api/api';
import { formatDateTime } from '../../time/formatters';
import { CreateAPIKeyPopup } from './CreateAPIKeyPopup';
import { CreateReadonlyUrlPopup } from './CreateReadonlyUrlPopup';
import { DeleteAPIKeyPopup } from './DeleteAPIKeyPopup';
import './APIKeyManager.css';

interface PropsT {
  retro: Retro;
  retroAuth: RetroAuth;
}

export const APIKeyManager = memo(({ retro, retroAuth }: PropsT) => {
  const [deleting, setDeleting] = useState<RetroApiKey | null>(null);
  const [adding, setAdding] = useState(0);
  const apiKeys = useAwaited(
    (signal) =>
      retroApiKeyService.getList(retro.id, retroAuth.retroToken, signal),
    [retro.id, retroAuth],
  );

  return (
    <ul className="api-key-manager">
      {!apiKeys.latestData ? (
        apiKeys.state === 'rejected' ? (
          <li>Failed to load API keys: {String(apiKeys.error)}</li>
        ) : (
          <li>Loading&hellip;</li>
        )
      ) : apiKeys.latestData.apiKeys.length ? (
        sortApiKeys(apiKeys.latestData.apiKeys).map((apiKey) => (
          <li key={apiKey.id} className="tile">
            <dl>
              <div className="name">
                <dt>Name</dt>
                <dd>{apiKey.name}</dd>
              </div>
              <div className="created">
                <dt>Created</dt>
                <dd>{formatDateTime(apiKey.created)}</dd>
              </div>
              <div className="lastUsed">
                <dt>Last Used</dt>
                <dd>
                  {apiKey.lastUsed ? formatDateTime(apiKey.lastUsed) : 'never'}
                </dd>
              </div>
              <div className="scopes">
                <dt>Scopes</dt>
                <dd>{apiKey.scopes.join(', ')}</dd>
              </div>
            </dl>
            <button
              type="button"
              title="Revoke this API Key"
              aria-label="Revoke this API Key"
              className="delete"
              onClick={() => setDeleting(apiKey)}
            >
              <Delete role="presentation" />
            </button>
          </li>
        ))
      ) : (
        <li>No API Keys</li>
      )}
      <li className="options">
        <button
          type="button"
          className="global-button"
          onClick={() => setAdding(1)}
        >
          + Create new API Key
        </button>
        <button
          type="button"
          className="global-button"
          onClick={() => setAdding(2)}
        >
          + Create new read-only URL
        </button>
      </li>
      <CreateAPIKeyPopup
        retro={retro}
        retroToken={retroAuth.retroToken}
        isOpen={adding === 1}
        onSave={() => apiKeys.forceRefresh()}
        onClose={() => setAdding(0)}
      />
      <CreateReadonlyUrlPopup
        retro={retro}
        retroToken={retroAuth.retroToken}
        isOpen={adding === 2}
        onSave={() => apiKeys.forceRefresh()}
        onClose={() => setAdding(0)}
      />
      <DeleteAPIKeyPopup
        retro={retro}
        retroToken={retroAuth.retroToken}
        apiKey={deleting}
        onDelete={() => apiKeys.forceRefresh()}
        onClose={() => setDeleting(null)}
      />
    </ul>
  );
});

function sortApiKeys(apiKeys: RetroApiKey[]): RetroApiKey[] {
  const sorted = [...apiKeys];
  sorted.sort(apiKeyCreatedComparator);
  return sorted;
}

// sort oldest to newest
const apiKeyCreatedComparator = (a: RetroApiKey, b: RetroApiKey) =>
  a.created - b.created;
