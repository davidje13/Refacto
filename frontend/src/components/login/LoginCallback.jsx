import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import handleLogin from './handleLogin';
import Header from '../common/Header';
import forbidExtraProps from '../../helpers/forbidExtraProps';

const LoginCallback = ({ history, service }) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    const { hash } = document.location;
    const nonce = window.sessionStorage.getItem('login-nonce');
    handleLogin(service, hash, nonce)
      .then((redirect) => {
        window.sessionStorage.removeItem('login-nonce');
        history.replace(redirect);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [setError]);

  return (
    <article className="page-retro-create">
      <Header
        documentTitle="Refacto"
        title="Refacto"
        backLink={{ label: 'Home', url: '/' }}
      />
      <p>{ error ? `Login failed: ${error}` : 'Logging in\u2026' }</p>
    </article>
  );
};

LoginCallback.propTypes = {
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,
  service: PropTypes.string.isRequired,
};

forbidExtraProps(LoginCallback, { alsoAllow: ['location', 'match', 'staticContext'] });

export default React.memo(withRouter(LoginCallback));
