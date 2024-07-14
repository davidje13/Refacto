import { useState, useEffect, memo } from 'react';
import { useLocation } from 'wouter';
import { handleLogin } from './handleLogin';
import { Header } from '../common/Header';
import { useEvent } from '../../api/reducer';
import { storage } from './storage';
import './LoginCallback.less';

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
    const nonce = storage.getItem('login-nonce');
    handleLogin(service, nonce, { search, hash }, ac.signal)
      .then((redirect) => {
        if (ac.signal.aborted) {
          return;
        }
        storage.removeItem('login-nonce');
        stableSetLocation(redirect, { replace: true });
      })
      .catch((err) => {
        if (ac.signal.aborted) {
          return;
        }
        if (!(err instanceof Error)) {
          storage.removeItem('login-nonce');
          setError(String(err));
        } else if (err.message === 'unrecognised login details') {
          // GitLab shows a bare link to the /sso/login URL on the confirmation page
          stableSetLocation('/', { replace: true });
        } else {
          storage.removeItem('login-nonce');
          setError(err.message);
        }
      });
    return () => ac.abort();
  }, [stableSetLocation]);

  return (
    <article className="page-login-callback">
      <Header
        documentTitle="Refacto"
        title="Refacto"
        backLink={{ label: 'Home', action: '/' }}
      />
      <p>{error ? `Login failed: ${error}` : 'Logging in\u2026'}</p>
    </article>
  );
});
