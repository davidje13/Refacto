import fetch from 'node-fetch';

export interface GitHubConfig {
  tokenInfoUrl: string;
  accessTokenUrl: string;
  userUrl: string;
  clientId: string;
  clientSecret: string;
}

export default async function extractId(
  config: GitHubConfig,
  externalToken: string,
): Promise<string> {
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
