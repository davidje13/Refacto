import getEnv from './helpers/getEnv';

const config = {
  hasherWorkFactor: getEnv('PASSWORD_HASH_WORK_FACTOR', 10),
  secretPepper: getEnv('PASSWORD_SECRET_PEPPER', ''),
  secretPrivateKeyPassphrase: getEnv('PRIVATE_KEY_PASSPHRASE', ''),
  simulatedDelay: getEnv('SIMULATED_DELAY', 0),
  simulatedSocketDelay: getEnv('SIMULATED_SOCKET_DELAY', 0),
  sso: {},
};

const googleClientId = getEnv('GOOGLE_CLIENT_ID', null);
if (googleClientId) {
  config.sso.google = {
    clientId: googleClientId,
    authUrl: getEnv('GOOGLE_AUTH_URL', 'https://accounts.google.com/o/oauth2/auth'),
    tokenInfoUrl: getEnv('GOOGLE_TOKEN_INFO_URL', 'https://oauth2.googleapis.com/tokeninfo'),
  };
}

const githubClientId = getEnv('GITHUB_CLIENT_ID', null);
if (githubClientId) {
  config.sso.github = {
    clientId: githubClientId,
    clientSecret: getEnv('GITHUB_CLIENT_SECRET', ''),
    authUrl: getEnv('GITHUB_AUTH_URL', 'https://github.com/login/oauth/authorize'),
    accessTokenUrl: getEnv('GITHUB_ACCESS_TOKEN_URL', 'https://github.com/login/oauth/access_token'),
    userUrl: getEnv('GITHUB_USER_URL', 'https://api.github.com/user'),
  };
}

export default config;
