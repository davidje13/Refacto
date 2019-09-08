import React, { useState, useEffect } from 'react';
import useRouter from '../../hooks/env/useRouter';
import handleLogin from './handleLogin';
import Header from '../common/Header';
import './LoginCallback.less';

interface PropsT {
  service: string;
}

const LoginCallback = ({ service }: PropsT): React.ReactElement => {
  const { history } = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { search, hash } = document.location;
    const nonce = window.sessionStorage.getItem('login-nonce');
    if (!nonce) {
      setError('');
      return;
    }
    handleLogin(service, nonce, { search, hash })
      .then((redirect) => {
        window.sessionStorage.removeItem('login-nonce');
        history.replace(redirect);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [setError]);

  return (
    <article className="page-login-callback">
      <Header
        documentTitle="Refacto"
        title="Refacto"
        backLink={{ label: 'Home', action: '/' }}
      />
      <p>{ error ? `Login failed: ${error}` : 'Logging in\u2026' }</p>
    </article>
  );
};

export default React.memo(LoginCallback);
