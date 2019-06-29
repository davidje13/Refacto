import fetch from 'node-fetch';

interface GoogleConfig {
  tokenInfoUrl: string;
  clientId: string;
}

export default async function extractId(
  config: GoogleConfig,
  externalToken: string,
): Promise<string> {
  // These checks can be done locally
  // see https://developers.google.com/identity/sign-in/web/backend-auth

  const params = new URLSearchParams();
  params.append('id_token', externalToken);
  // POST does not work (despite being listed in Google's docs)
  const res = await fetch(`${config.tokenInfoUrl}?${params.toString()}`);

  if (res.status >= 500) {
    throw new Error('validation internal error');
  }

  const externalTokenInfo = await res.json();
  if (res.status !== 200 || externalTokenInfo.error) {
    throw new Error(`validation error ${externalTokenInfo.error}`);
  }

  if (externalTokenInfo.aud !== config.clientId) {
    throw new Error('audience mismatch');
  }

  // TODO: use externalTokenInfo.jti nonce to prevent replay attacks
  // (would need to store value at least until exp time)

  return externalTokenInfo.sub;
}
