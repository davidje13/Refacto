import { useState, type ReactElement } from 'react';
import { useSubmissionCallback } from '../../hooks/useSubmissionCallback';
import { realAutoFocus } from '../../helpers/realAutoFocus';
import { retroAuthService, retroAuthTracker } from '../../api/api';
import { Alert } from '../common/Alert';

interface PropsT {
  slug: string;
  retroId: string;
  autoFocus?: boolean;
  encourageBrowserSave?: boolean;
}

export const PasswordForm = ({
  slug,
  retroId,
  autoFocus,
  encourageBrowserSave,
}: PropsT): ReactElement => {
  const [rememberMe, setRememberMe] = useState(false);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');

  const [handleSubmit, sending, error] = useSubmissionCallback(async () => {
    if (!password) {
      throw new Error('Enter a password');
    }

    const retroAuth = await retroAuthService.getRetroAuthForPassword(
      retroId,
      password,
    );
    retroAuthTracker.set(retroId, retroAuth, rememberMe);
    setSuccess(true);
    if (encourageBrowserSave) {
      try {
        // This navigation is required for iOS Safari to notice the form has been
        // submitted successfully and offer to save the password
        window.history.replaceState(null, '');
      } catch {}
    }
  });

  return (
    <form
      className="global-form"
      onSubmit={handleSubmit}
      action={encourageBrowserSave ? '#login' : undefined}
    >
      {/* 'username' is included for password managers to distinguish between retros */}
      <input
        type="text" // note: Chrome + Firefox fail to recognise type="hidden"
        hidden
        readOnly
        name="username"
        value={retroId}
        autoComplete="username"
      />
      {/* 'name' is a friendly name for password managers (but can be changed) */}
      <input
        type="text"
        hidden
        readOnly
        name="name"
        value={slug}
        autoComplete="name"
      />
      <input
        ref={autoFocus ? realAutoFocus : undefined}
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        disabled={sending || success}
        autoComplete="current-password"
        required
      />
      <label className="checkbox">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.currentTarget.checked)}
          autoComplete="off"
        />
        Keep me logged in to this retro for 6 months
      </label>
      <button
        type="submit"
        className="wide-button"
        disabled={sending || success || password === ''}
      >
        {sending || success ? '\u2026' : 'Go'}
      </button>
      <Alert message={error} spacer />
    </form>
  );
};
