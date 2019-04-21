import { userTokenService, userTokenTracker } from '../../api/api';

export default async function handleLogin(
  service,
  localNonce,
  { search, hash },
) {
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
  }

  if (!externalToken) {
    throw new Error('unrecognised login details');
  }

  const { redirect, nonce } = JSON.parse(state);
  if (!localNonce || nonce !== localNonce) {
    throw new Error('possible cross-site request forgery');
  }

  const userToken = await userTokenService.login(service, externalToken);
  userTokenTracker.set(userToken);
  return redirect || '/';
}
