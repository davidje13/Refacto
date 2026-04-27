import { useState, memo, Suspense, useCallback } from 'react';
import type { Retro, RetroAuth } from '@refacto/shared/api-entities';
import type { RetroDispatch, RetroDispatchSpec } from '../../api/RetroTracker';
import {
  retroService,
  retroAuthService,
  retroAuthTracker,
  userDataTracker,
} from '../../api/api';
import { context, type Spec } from '../../api/reducer';
import { needArchive } from '../../actions/retro';
import { SlugEntry } from '../retro-create/SlugEntry';
import { RetroFormatPicker } from '../retro-create/RetroFormatPicker';
import { getRetroFormatDetails } from '../retro-formats/formats';
import { Alert } from '../common/Alert';
import { LoadingIndicator } from '../common/Loader';
import { SetPassword } from '../common/SetPassword';
import { useSubmissionCallback } from '../../hooks/useSubmissionCallback';
import { DeleteRetroButton } from './DeleteRetroButton';
import { APIKeyManager } from './APIKeyManager';
import './SettingsForm.css';

interface PropsT {
  retro: Retro;
  retroAuth: RetroAuth;
  dispatch: RetroDispatch;
  onSave?: (savedRetro: Retro) => void;
}

export const SettingsForm = memo(
  ({ retro, retroAuth, dispatch, onSave }: PropsT) => {
    const [name, setName] = useState(retro.name);
    const [format, setFormat] = useState(retro.format);
    const [slug, setSlug] = useState(retro.slug);
    const [editingPassword, setEditingPassword] = useState(false);
    const [passwordMatches, setPasswordMatches] = useState(false);
    const [evictUsers, setEvictUsers] = useState(true);
    const [newPassword, setNewPassword] = useState('');
    const [optionsSpec, setOptionsSpec] = useState<
      Spec<Record<string, unknown>>
    >({});

    const handleChangeFormatOption = useCallback(
      (spec: Spec<Record<string, unknown>>) =>
        setOptionsSpec((prev) => context.combine([prev, spec])),
      [],
    );

    const [handleSubmit, sending, error] = useSubmissionCallback(async () => {
      if (!name || !slug) {
        throw new Error('Cannot set blank name or slug');
      }

      if (editingPassword && !passwordMatches) {
        throw new Error('Passwords do not match');
      }

      if (editingPassword && newPassword) {
        await retroService.setPassword(
          retro.id,
          retroAuth.retroToken,
          newPassword,
          evictUsers,
        );
        await updateRetroToken(retro.id, newPassword);
      }
      if (format !== retro.format) {
        await retroService.setFormat(retro.id, retroAuth.retroToken, format);
      }
      const specs: RetroDispatchSpec = [];
      if (name !== retro.name) {
        specs.push({ name: ['=', name] });
      }
      if (retroAuth.scopes.includes('manage') && slug !== retro.slug) {
        specs.push({ slug: ['=', slug] });
      }
      if (!context.isNoOp(optionsSpec)) {
        specs.push({ options: optionsSpec });
      }
      const saved = await dispatch.sync(specs);
      onSave?.(saved);
    });

    const RetroFormatOptions = getRetroFormatDetails(format).options;

    const manageOptions = (
      <>
        <h2>Access</h2>
        <label className="retro-url">
          Retro URL
          <div className="info">
            (may contain lowercase letters, numbers, dashes and underscores)
          </div>
          <SlugEntry
            value={slug}
            ariaLabel="Retro ID"
            onChange={setSlug}
            oldValue={retro.slug}
            showAvailability
          />
        </label>
        <details
          open={editingPassword}
          onToggle={(e) => setEditingPassword(e.currentTarget.open)}
        >
          <summary>Change Collaborator Password</summary>
          {editingPassword ? ( // only render content if editing, to avoid validation of hidden items
            <div className="content">
              <SetPassword
                username={retro.id}
                name={slug}
                label="New collaborator password"
                confirmLabel="Confirm password"
                password={newPassword}
                setPassword={setNewPassword}
                setMatches={setPasswordMatches}
              />
              <label className="checkbox">
                <input
                  name="evict-users"
                  type="checkbox"
                  checked={evictUsers}
                  onChange={(e) => setEvictUsers(e.currentTarget.checked)}
                  autoComplete="off"
                />
                Prompt current participants to enter new password immediately
              </label>
            </div>
          ) : null}
        </details>
        <details>
          <summary>Manage API Keys</summary>
          <div className="content">
            <p>
              API keys can be used to link external services, for example
              displaying action items in a chat. To build your own integration,
              see the{' '}
              <a href="/api-docs" target="_blank" rel="noopener noreferrer">
                API Documentation
              </a>
              .
            </p>
            <p>
              This retro&rsquo;s ID is:{' '}
              <code className="retro-id-display">{retro.id}</code>
            </p>
            <APIKeyManager retro={retro} retroAuth={retroAuth} />
          </div>
        </details>
        <details>
          <summary>Delete Retro</summary>
          <div className="content">
            <DeleteRetroButton retro={retro} retroAuth={retroAuth} />
          </div>
        </details>
      </>
    );

    return (
      <form onSubmit={handleSubmit} className="global-form retro-settings">
        <label>
          Retro Name
          <input
            name="name"
            type="text"
            placeholder="retro name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            autoComplete="off"
            required
          />
        </label>
        <RetroFormatPicker value={format} onChange={setFormat} />
        {RetroFormatOptions ? (
          <Suspense fallback={<LoadingIndicator />}>
            <RetroFormatOptions
              retroOptions={context.update(retro.options, optionsSpec)}
              onChangeOption={handleChangeFormatOption}
            />
          </Suspense>
        ) : null}
        {retroAuth.scopes.includes('manage') ? manageOptions : null}
        <div className="form-actions-shadow" />
        <div className="bottom-shadow-cover" />
        <div className="form-actions">
          <button
            type="submit"
            className="wide-button"
            title="Save Changes"
            disabled={sending}
          >
            {sending ? '\u2026' : 'Save'}
          </button>
          <Alert
            warning={!error}
            message={
              error ||
              (format !== retro.format && needArchive(retro)
                ? 'The current retro will be archived when changing the format'
                : null)
            }
            spacer
          />
        </div>
      </form>
    );
  },
);

async function updateRetroToken(retroId: string, password: string) {
  // prefer obtaining token from the logged in user, as this is likely to have more permissions
  try {
    const userData = userDataTracker.peekState()[0];
    if (userData) {
      const retroAuth = await retroAuthService.getRetroAuthForUser(
        retroId,
        userData.userToken,
        new AbortController().signal,
      );
      retroAuthTracker.set(retroId, retroAuth);
      return;
    }
  } catch {}

  // fall-back to obtaining token from the password
  const retroAuth = await retroAuthService.getRetroAuthForPassword(
    retroId,
    password,
  );
  retroAuthTracker.set(retroId, retroAuth);
}
