import { userTokenService, userTokenTracker } from '../../api/api';

export default async function handleLogin(service, hash, nonce) {
  let userToken = null;
  let redirect = null;
  if (service === 'google') {
    const hashParams = new URLSearchParams(hash.substr(1));
    const externalToken = hashParams.get('id_token');
    if (externalToken) {
      userToken = await userTokenService.login('google', externalToken, nonce);
      redirect = hashParams.get('state');
    }
  }
  if (!userToken) {
    throw new Error('unrecognised login details');
  }
  userTokenTracker.set(userToken);
  return redirect || '/';
}
