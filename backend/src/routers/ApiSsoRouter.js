import fetch from 'node-fetch';
import { Router } from 'websocket-express';

async function extractGoogleId(config, externalToken) {
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

async function extractGitHubId(config, externalToken) {
  const accessParams = new URLSearchParams();
  accessParams.append('code', externalToken);
  accessParams.append('client_id', config.clientId);
  accessParams.append('client_secret', config.clientSecret);
  const accessRes = await fetch(config.accessTokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: accessParams.toString(),
  });

  const accessResults = new URLSearchParams(await accessRes.text());

  const error = accessResults.get('error');
  if (error) {
    throw new Error(`validation error ${error}`);
  }

  const accessToken = accessResults.get('access_token');
  if (!accessToken) {
    throw new Error('validation internal error');
  }

  const userRes = await fetch(config.userUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const userResults = await userRes.json();
  return userResults.id;
}

const extractors = {
  google: extractGoogleId,
  github: extractGitHubId,
};

export default class ApiSsoRouter extends Router {
  constructor(userAuthService, config) {
    super();

    Object.keys(config).forEach((name) => {
      const extract = extractors[name];
      if (!extract) {
        throw new Error(`Unknown SSO service: ${name}`);
      }

      this.post(`/${name}`, async (req, res) => {
        const { externalToken } = req.body;
        if (!externalToken) {
          res.status(400).end();
          return;
        }

        try {
          const externalId = await extract(config[name], externalToken);
          if (!externalId) {
            throw new Error('failed to get user ID');
          }

          const userToken = await userAuthService.grantToken({
            provider: name,
            id: `${name}-${externalId}`,
          });
          res.status(200).json({ userToken });
        } catch (e) {
          res.status(400).json({ error: e.message || 'internal error' });
        }
      });
    });
  }
}
