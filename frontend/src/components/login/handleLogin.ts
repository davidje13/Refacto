import { userTokenService, userTokenTracker } from '../../api/api';

interface LocationT {
  search: string;
  hash: string;
  redirectUri: string;
}

export async function handleLogin(
  service: string,
  localState: string | null,
  { search, hash, redirectUri }: LocationT,
  signal: AbortSignal,
): Promise<string> {
  let externalToken: string | null = null;
  let state: string | null = null;

  const hashParams = new URLSearchParams(hash.substring(1));
  const searchParams = new URLSearchParams(search.substring(1));

  if (service === 'public') {
    externalToken = hashParams.get('token');
    state = hashParams.get('state');
  } else if (service === 'google') {
    externalToken = hashParams.get('id_token');
    state = hashParams.get('state');
  } else if (service === 'github') {
    externalToken = searchParams.get('code');
    state = searchParams.get('state');
  } else if (service === 'gitlab') {
    externalToken = searchParams.get('code');
    state = searchParams.get('state');
  }

  if (!externalToken || state === null) {
    throw new Error('unrecognised login details');
  }

  if (!localState) {
    // nonce checking ensures the token we receive is actually the result of our initial request
    // (i.e. an attacker has not invoked the redirect URI with their own token so that the user
    // is logged in as the wrong account). If we cannot validate this, the login cannot continue.
    throw new Error(
      'possible cross-site request forgery (you may need to enable local storage)',
    );
  }
  const { redirect, nonce } = JSON.parse(state);
  const local = JSON.parse(localState);
  if (nonce !== local.nonce) {
    throw new Error('possible cross-site request forgery');
  }

  const userToken = await userTokenService.login(
    service,
    externalToken,
    redirectUri,
    local.codeVerifier,
    signal,
  );
  userTokenTracker.set(userToken);
  return redirect || '/';
}
