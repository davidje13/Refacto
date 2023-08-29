import React, { useState, useEffect, memo } from 'react';
import { useLocation } from 'wouter';
import handleLogin from './handleLogin';
import Header from '../common/Header';
import storage from './storage';
import './LoginCallback.less';

interface PropsT {
  service: string;
}

export default memo(({ service }: PropsT) => {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { search, hash } = document.location;
    const nonce = storage.getItem('login-nonce');
    handleLogin(service, nonce, { search, hash })
      .then((redirect) => {
        storage.removeItem('login-nonce');
        setLocation(redirect, { replace: true });
      })
      .catch((err) => {
        if (err.message === 'unrecognised login details') {
          // GitLab shows a bare link to the /sso/login URL on the confirmation page
          setLocation('/', { replace: true });
        } else {
          storage.removeItem('login-nonce');
          setError(err.message);
        }
      });
  }, [setError]);

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
