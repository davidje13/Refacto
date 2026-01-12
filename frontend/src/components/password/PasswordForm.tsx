import { useState, type ReactElement } from 'react';
import { useSubmissionCallback } from '../../hooks/useSubmissionCallback';
import { retroTokenService, retroTokenTracker } from '../../api/api';
import { Alert } from '../common/Alert';

interface PropsT {
  slug: string;
  retroId: string;
}

export const PasswordForm = ({ slug, retroId }: PropsT): ReactElement => {
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');

  const [handleSubmit, sending, error] = useSubmissionCallback(async () => {
    if (!password) {
      throw new Error('Enter a password');
    }

    const retroToken = await retroTokenService.getRetroTokenForPassword(
      retroId,
      password,
    );
    retroTokenTracker.set(retroId, retroToken);
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
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        disabled={sending || success}
        autoComplete="current-password"
        required
      />
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
