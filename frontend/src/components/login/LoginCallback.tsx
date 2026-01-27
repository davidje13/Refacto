import { useState, useEffect, memo } from 'react';
import { useLocation } from 'wouter';
import { handleLogin } from './handleLogin';
import { useEvent } from '../../hooks/useEvent';
import { sessionStore } from '../../helpers/storage';
import { Header } from '../common/Header';

interface PropsT {
  service: string;
}

export const LoginCallback = memo(({ service }: PropsT) => {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  const stableSetLocation = useEvent(setLocation);

  useEffect(() => {
    const ac = new AbortController();
    const { search, hash } = document.location;
    const redirectUri = document.location.href.split('?')[0]!;
    const localState = sessionStore.getItem('login-state');
    handleLogin(service, localState, { search, hash, redirectUri }, ac.signal)
      .then((redirect) => {
        if (ac.signal.aborted) {
          return;
        }
        sessionStore.removeItem('login-state');
        if (
          new URL(redirect, document.location.href).host !==
          document.location.host
        ) {
          // possibly a malicious redirect - ignore it and substitute a safe one
          redirect = '/';
        }
        stableSetLocation(redirect, { replace: true });
      })
      .catch((err) => {
        if (ac.signal.aborted) {
          return;
        }
        if (!(err instanceof Error)) {
          sessionStore.removeItem('login-state');
          setError(String(err));
        } else if (err.message === 'unrecognised login details') {
          // GitLab shows a bare link to the /sso/login URL on the confirmation page
          stableSetLocation('/', { replace: true });
        } else {
          sessionStore.removeItem('login-state');
          setError(err.message);
        }
      });
    return () => ac.abort();
  }, [stableSetLocation]);

  return (
    <article className="page-login-callback short-page">
      <Header
        documentTitle="Refacto"
        title="Refacto"
        backLink={{ label: 'Home', action: '/' }}
      />
      <p>{error ? `Login failed: ${error}` : 'Logging in\u2026'}</p>
    </article>
  );
});
