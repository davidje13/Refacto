import React, { useCallback, memo } from 'react';
import useConfig from '../../hooks/data/useConfig';
import { toHex, randomBytes } from '../../helpers/crypto';
import storage from './storage';
import './LoginForm.less';

function makeState(redirect: string): string {
  const nonce = toHex(randomBytes(10));
  if (!storage.setItem('login-nonce', nonce)) {
    window.alert('You must enable session cookies or storage in your browser settings to log in');
    throw new Error('insufficient browser permissions to log in');
  }
  return JSON.stringify({ nonce, redirect });
}

interface PropsT {
  message?: string | null;
  redirect?: string | null;
}

export default memo(({
  message,
  redirect,
}: PropsT) => {
  const config = useConfig();
  const sso = config?.sso ?? {};
  const googleConfig = sso['google'];
  const githubConfig = sso['github'];
  const gitlabConfig = sso['gitlab'];

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

  const handleGitLabClick = useCallback(() => {
    const targetUrl = new URL('/sso/gitlab', domain);
    const url = new URL(gitlabConfig.authUrl);
    url.searchParams.set('redirect_uri', targetUrl.toString());
    url.searchParams.set('state', makeState(resolvedRedirect));
    url.searchParams.set('response_type', 'token');
    url.searchParams.set('scope', 'openid');
    url.searchParams.set('client_id', gitlabConfig.clientId);
    document.location.href = url.toString();
  }, [resolvedRedirect, domain, gitlabConfig]);

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
            Continue with Google
          </button>
        ) : null }
        { githubConfig ? (
          <button
            type="button"
            className="sso-github"
            onClick={handleGitHubClick}
          >
            Continue with GitHub
          </button>
        ) : null }
        { gitlabConfig ? (
          <button
            type="button"
            className="sso-gitlab"
            onClick={handleGitLabClick}
          >
            Continue with GitLab
          </button>
        ) : null }
      </p>
    </div>
  );
});
