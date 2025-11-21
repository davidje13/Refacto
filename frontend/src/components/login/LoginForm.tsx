import { memo, useLayoutEffect } from 'react';
import { useConfig } from '../../hooks/data/useConfig';
import { digest, randomBytes, toB64 } from '../../helpers/crypto';
import { storage } from './storage';
import './LoginForm.css';

function storeState(state: unknown) {
  if (!storage.setItem('login-state', JSON.stringify(state))) {
    window.alert(
      'You must enable session cookies or storage in your browser settings to log in',
    );
    throw new Error('insufficient browser permissions to log in');
  }
}

interface PropsT {
  message?: string | null;
  redirect?: string | null;
}

export const LoginForm = memo(({ message, redirect }: PropsT) => {
  const config = useConfig();
  const sso = config?.sso ?? {};

  const publicConfig = sso['public'];
  const googleConfig = sso['google'];
  const githubConfig = sso['github'];
  const gitlabConfig = sso['gitlab'];

  const resolvedRedirect = redirect || document.location.pathname;
  const domain = document.location.origin;

  useLayoutEffect(() => {
    if (publicConfig) {
      const nonce = toB64(randomBytes(15));
      storeState({ nonce });
      const targetUrl = new URL('/sso/public', domain);
      const url = new URL(publicConfig.authUrl, document.location.href);
      url.searchParams.set('redirect_uri', targetUrl.toString());
      url.searchParams.set(
        'state',
        JSON.stringify({ nonce, redirect: resolvedRedirect }),
      );
      document.location.href = url.toString();
    }
  }, [publicConfig]);

  return (
    <div className="login-form">
      {message ? <p>{message}</p> : null}
      <p>
        {googleConfig ? (
          <button
            type="button"
            className="global-button primary sso-google"
            onClick={() => {
              const nonce = toB64(randomBytes(15));
              storeState({ nonce });
              const targetUrl = new URL('/sso/google', domain);
              const url = new URL(googleConfig.authUrl);
              url.searchParams.set('redirect_uri', targetUrl.toString());
              url.searchParams.set(
                'state',
                JSON.stringify({ nonce, redirect: resolvedRedirect }),
              );
              url.searchParams.set('response_type', 'id_token');
              url.searchParams.set('scope', 'openid');
              url.searchParams.set('client_id', googleConfig.clientId);
              url.searchParams.set('ss_domain', domain);
              url.searchParams.set('fetch_basic_profile', 'false');
              document.location.href = url.toString();
            }}
          >
            Continue with Google
          </button>
        ) : null}
        {githubConfig ? (
          <button
            type="button"
            className="global-button primary sso-github"
            onClick={() => {
              const nonce = toB64(randomBytes(15));
              storeState({ nonce });
              const targetUrl = new URL('/sso/github', domain);
              const url = new URL(githubConfig.authUrl);
              url.searchParams.set('redirect_uri', targetUrl.toString());
              url.searchParams.set(
                'state',
                JSON.stringify({ nonce, redirect: resolvedRedirect }),
              );
              url.searchParams.set('scope', '');
              url.searchParams.set('client_id', githubConfig.clientId);
              document.location.href = url.toString();
            }}
          >
            Continue with GitHub
          </button>
        ) : null}
        {gitlabConfig ? (
          <button
            type="button"
            className="global-button primary sso-gitlab"
            onClick={async () => {
              const nonce = toB64(randomBytes(15));
              const codeVerifier = toB64(randomBytes(36));
              const codeChallenge = toB64(
                await digest(codeVerifier, 'SHA-256'),
              );
              storeState({ nonce, codeVerifier });
              const targetUrl = new URL('/sso/gitlab', domain);
              const url = new URL(gitlabConfig.authUrl);
              url.searchParams.set('redirect_uri', targetUrl.toString());
              url.searchParams.set(
                'state',
                JSON.stringify({ nonce, redirect: resolvedRedirect }),
              );
              url.searchParams.set('response_type', 'code');
              url.searchParams.set('code_challenge', codeChallenge);
              url.searchParams.set('code_challenge_method', 'S256');
              url.searchParams.set('scope', 'email');
              url.searchParams.set('client_id', gitlabConfig.clientId);
              document.location.href = url.toString();
            }}
          >
            Continue with GitLab
          </button>
        ) : null}
      </p>
    </div>
  );
});
