import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import useConfig from '../../hooks/data/useConfig';
import forbidExtraProps from '../../helpers/forbidExtraProps';
import './LoginForm.less';

function randomString() {
  const array = new Uint8Array(10);
  crypto.getRandomValues(array);

  const pad = '00';
  let result = '';
  for (let i = 0; i < array.length; i += 1) {
    const v = array[i].toString(16);
    result += `${pad.substr(v.length)}${v}`;
  }
  return result;
}

function makeState(redirect) {
  const nonce = randomString();
  window.sessionStorage.setItem('login-nonce', nonce);
  return JSON.stringify({ nonce, redirect });
}

const LoginForm = ({ message, redirect }) => {
  const config = useConfig();
  const googleConfig = config?.sso?.google;
  const githubConfig = config?.sso?.github;

  const resolvedRedirect = redirect || document.location.pathname;
  const domain = document.location.origin;

  const handleGoogleClick = useCallback(() => {
    const targetUrl = new URL('/sso/google', domain);
    const url = new URL(googleConfig.authUrl);
    url.searchParams.set('redirect_uri', targetUrl.toString());
    url.searchParams.set('state', makeState(resolvedRedirect));
    url.searchParams.set('response_type', 'id_token');
    url.searchParams.set('scope', 'openid');
    url.searchParams.set('client_id', googleConfig.clientId);
    url.searchParams.set('ss_domain', domain);
    url.searchParams.set('fetch_basic_profile', 'false');
    document.location.href = url.toString();
  }, [resolvedRedirect, domain, googleConfig]);

  const handleGitHubClick = useCallback(() => {
    const targetUrl = new URL('/sso/github', domain);
    const url = new URL(githubConfig.authUrl);
    url.searchParams.set('redirect_uri', targetUrl.toString());
    url.searchParams.set('state', makeState(resolvedRedirect));
    url.searchParams.set('scope', '');
    url.searchParams.set('client_id', githubConfig.clientId);
    document.location.href = url.toString();
  }, [resolvedRedirect, domain, githubConfig]);

  return (
    <div className="login-form">
      { message ? (<p>{ message }</p>) : null }
      <p>
        { googleConfig ? (
          <button
            type="button"
            className="sso-google"
            onClick={handleGoogleClick}
          >
            Sign in with Google
          </button>
        ) : null }
        { githubConfig ? (
          <button
            type="button"
            className="sso-github"
            onClick={handleGitHubClick}
          >
            Sign in with GitHub
          </button>
        ) : null }
      </p>
    </div>
  );
};

LoginForm.propTypes = {
  message: PropTypes.string,
  redirect: PropTypes.string,
};

LoginForm.defaultProps = {
  message: null,
  redirect: null,
};

forbidExtraProps(LoginForm);

export default React.memo(LoginForm);