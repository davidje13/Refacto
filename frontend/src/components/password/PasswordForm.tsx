import { useState, type ReactElement } from 'react';
import { useSubmissionCallback } from '../../hooks/useSubmissionCallback';
import { realAutoFocus } from '../../helpers/realAutoFocus';
import { retroAuthService, retroAuthTracker } from '../../api/api';
import { Alert } from '../common/Alert';

interface PropsT {
  slug: string;
  retroId: string;
  autoFocus?: boolean;
}

export const PasswordForm = ({
  slug,
  retroId,
  autoFocus,
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
  });

  return (
    <form className="global-form" onSubmit={handleSubmit}>
      {/* 'username' is included for password managers to distinguish between retros */}
      <input
        type="hidden"
        name="username"
        value={retroId}
        autoComplete="username"
      />
      {/* 'name' is a friendly name for password managers (but can be changed) */}
      <input type="hidden" name="name" value={slug} autoComplete="name" />
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
