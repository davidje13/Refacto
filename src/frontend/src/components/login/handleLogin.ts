import { userTokenService, userTokenTracker } from '../../api/api';

interface LocationT {
  search: string;
  hash: string;
}

export default async function handleLogin(
  service: string,
  localNonce: string | null,
  { search, hash }: LocationT,
): Promise<string> {
  let externalToken = null;
  let state = null;

  const hashParams = new URLSearchParams(hash.substr(1));
  const searchParams = new URLSearchParams(search.substr(1));

  if (service === 'google') {
    externalToken = hashParams.get('id_token');
    state = hashParams.get('state');
  } else if (service === 'github') {
    externalToken = searchParams.get('code');
    state = searchParams.get('state');
  } else if (service === 'gitlab') {
    externalToken = hashParams.get('access_token');
    state = hashParams.get('state');
  }

  if (!externalToken) {
    throw new Error('unrecognised login details');
  }

  const { redirect, nonce } = JSON.parse(state!);
  if (!localNonce) {
    // nonce checking ensures the token we receive is actually the result of our initial request
    // (i.e. an attacker has not invoked the redirect URI with their own token so that the user
    // is logged in as the wrong account). If we cannot validate this, the login cannot continue.
    throw new Error('possible cross-site request forgery (you may need to enable local storage)');
  }
  if (nonce !== localNonce) {
    throw new Error('possible cross-site request forgery');
  }

  const userToken = await userTokenService.login(service, externalToken);
  userTokenTracker.set(userToken);
  return redirect || '/';
}
