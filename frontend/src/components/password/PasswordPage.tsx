import { useState, ReactElement } from 'react';
import useAwaited from 'react-hook-awaited';
import { Header } from '../common/Header';
import { useSubmissionCallback } from '../../hooks/useSubmissionCallback';
import { useUserToken } from '../../hooks/data/useUserToken';
import { retroTokenService, retroTokenTracker } from '../../api/api';
import { Alert } from '../common/Alert';
import './PasswordPage.css';

interface PropsT {
  slug: string;
  retroId: string;
}

export const PasswordPage = ({ slug, retroId }: PropsT): ReactElement => {
  const [password, setPassword] = useState('');
  const userToken = useUserToken();

  const [handleSubmit, sending, error] = useSubmissionCallback(async () => {
    if (!password) {
      throw new Error('Enter a password');
    }

    const retroToken = await retroTokenService.getRetroTokenForPassword(
      retroId,
      password,
    );
    retroTokenTracker.set(retroId, retroToken);
  });

  const checkingUser = useAwaited(
    async (signal) => {
      if (!userToken) {
        return;
      }
      const retroToken = await retroTokenService.getRetroTokenForUser(
        retroId,
        userToken,
        signal,
      );
      retroTokenTracker.set(retroId, retroToken);
    },
    [userToken, retroId, retroTokenService, retroTokenTracker],
  );

  if (userToken && checkingUser.state === 'pending') {
    return (
      <article className="page-password-user">
        <Header
          documentTitle={`${slug} - Refacto`}
          title={slug}
          backLink={{ label: 'Home', action: '/' }}
        />
        <div className="loader">Loading&hellip;</div>
      </article>
    );
  }

  return (
    <article className="page-password">
      <Header
        documentTitle={`${slug} - Refacto`}
        title={`Password for ${slug}`}
        backLink={{ label: 'Home', action: '/' }}
      />
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
          disabled={sending}
          autoComplete="current-password"
          required
        />
        <button
          type="submit"
          className="wide-button"
          disabled={sending || password === ''}
        >
          {sending ? '\u2026' : 'Go'}
        </button>
        <Alert message={error} />
      </form>
    </article>
  );
};
