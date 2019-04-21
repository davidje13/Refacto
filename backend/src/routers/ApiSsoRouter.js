import fetch from 'node-fetch';
import { Router } from 'websocket-express';

async function extractGoogleId(config, externalToken, nonce) {
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
  if (!nonce || externalTokenInfo.nonce !== nonce) {
    throw new Error('nonce mismatch');
  }

  // TODO: use externalTokenInfo.jti nonce to prevent replay attacks
  // (would need to store value at least until exp time)

  return externalTokenInfo.sub;
}

export default class ApiSsoRouter extends Router {
  constructor(userAuthService, config) {
    super();

    this.post('/google', async (req, res) => {
      const { externalToken, nonce } = req.body;
      if (!externalToken || !config.google) {
        res.status(400).end();
        return;
      }

      try {
        const googleId = await extractGoogleId(
          config.google,
          externalToken,
          nonce,
        );

        const userToken = await userAuthService.grantToken({
          provider: 'google',
          id: `google-${googleId}`,
        });
        res.status(200).json({ userToken });
      } catch (e) {
        res.status(400).json({ error: e.message || 'internal error' });
      }
    });
  }
}
