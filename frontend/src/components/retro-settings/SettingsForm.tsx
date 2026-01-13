import { useState, memo, type ReactNode } from 'react';
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

    let passwordSection: ReactNode;

    if (editingPassword) {
      passwordSection = (
        <fieldset className="edit-password">
          <legend>Change password</legend>
          <SetPassword
            username={retro.id}
            name={slug}
            label="Collaborator password"
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
        </fieldset>
      );
    } else {
      passwordSection = (
        <button
          type="button"
          className="global-button optional edit-password-button"
          onClick={() => setEditingPassword(true)}
        >
          Change collaborator password
        </button>
      );
    }

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
        <label>
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
        {passwordSection}
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
        <button
          type="submit"
          className="wide-button"
          title="Save Changes"
          disabled={sending}
        >
          {sending ? '\u2026' : 'Save'}
        </button>
        <Alert message={error} />
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
