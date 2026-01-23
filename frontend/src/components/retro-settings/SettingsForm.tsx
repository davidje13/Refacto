import { useState, memo } from 'react';
import type { Retro } from '../../shared/api-entities';
import type { RetroDispatch } from '../../api/RetroTracker';
import {
  retroService,
  retroAuthService,
  retroAuthTracker,
  userDataTracker,
} from '../../api/api';
import { context } from '../../api/reducer';
import { PickerInput } from '../common/PickerInput';
import { SlugEntry } from '../retro-create/SlugEntry';
import { Alert } from '../common/Alert';
import { SetPassword } from '../common/SetPassword';
import { useSubmissionCallback } from '../../hooks/useSubmissionCallback';
import { OPTIONS } from '../../helpers/optionManager';
import { getThemes } from '../retro-formats/mood/categories/FaceIcon';
import { APIKeyManager } from './APIKeyManager';
import './SettingsForm.css';

interface PropsT {
  retro: Retro;
  retroToken: string;
  dispatch: RetroDispatch;
  onSave?: (savedRetro: Retro) => void;
}

export const SettingsForm = memo(
  ({ retro, retroToken, dispatch, onSave }: PropsT) => {
    const [name, setName] = useState(retro.name);
    const [slug, setSlug] = useState(retro.slug);
    const [editingPassword, setEditingPassword] = useState(false);
    const [passwordMatches, setPasswordMatches] = useState(false);
    const [evictUsers, setEvictUsers] = useState(true);
    const [newPassword, setNewPassword] = useState('');
    const [alwaysShowAddAction, setAlwaysShowAddAction] = useState(
      OPTIONS.alwaysShowAddAction.read(retro.options),
    );
    const [theme, setTheme] = useState(OPTIONS.theme.read(retro.options));

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
          retroToken,
          newPassword,
          evictUsers,
        );
        await updateRetroToken(retro.id, newPassword);
      }
      const saved = await dispatch.sync([
        {
          name: ['=', name],
          slug: ['=', slug],
          options: context.combine([
            OPTIONS.alwaysShowAddAction.specSet(alwaysShowAddAction),
            OPTIONS.theme.specSet(theme),
          ]),
        },
      ]);
      onSave?.(saved);
    });

    const themeChoices = getThemes().map(([value, detail]) => ({
      value,
      label: (
        <span className="theme-row">
          <span className="name">{detail.name}</span>
          <span className="preview">{detail.icons.happy}</span>
          <span className="preview">{detail.icons.meh}</span>
          <span className="preview">{detail.icons.sad}</span>
        </span>
      ),
    }));

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
        <fieldset className="minimal">
          <legend>Theme</legend>
          <PickerInput
            className="theme"
            name="theme"
            value={theme}
            onChange={setTheme}
            options={themeChoices}
          />
        </fieldset>
        <h2>Behaviour</h2>
        <label className="checkbox">
          <input
            name="always-show-add-action"
            type="checkbox"
            checked={alwaysShowAddAction}
            onChange={(e) => setAlwaysShowAddAction(e.currentTarget.checked)}
            autoComplete="off"
          />
          Sticky &ldquo;add action&rdquo; input
        </label>
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
            <>
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
            </>
          ) : null}
        </details>
        <details>
          <summary>Manage API Keys</summary>
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
            This retro&rsquo;s ID is: <code>{retro.id}</code>
          </p>
          <APIKeyManager retro={retro} retroToken={retroToken} />
        </details>
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
          <Alert message={error} spacer />
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
