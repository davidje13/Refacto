import WebSocketExpress from 'websocket-express';
import ApiRouter from './routers/ApiRouter';
import ApiConfigRouter from './routers/ApiConfigRouter';
import ApiSsoRouter from './routers/ApiSsoRouter';
import StaticRouter from './routers/StaticRouter';
import Hasher from './hash/Hasher';
import TokenManager from './tokens/TokenManager';
import InMemoryMap from './persistence/InMemoryMap';
import RetroService from './services/InMemoryRetroService';
import RetroAuthService from './services/RetroAuthService';
import UserAuthService from './services/UserAuthService';
import getEnv from './helpers/getEnv';

const ssoConfig = {};
const clientConfig = {
  sso: {},
};

const hasherWorkFactor = getEnv('PASSWORD_HASH_WORK_FACTOR', 10);
const secretPepper = getEnv('PASSWORD_SECRET_PEPPER', '');
const secretPrivateKeyPassphrase = getEnv('PRIVATE_KEY_PASSPHRASE', '');

const googleClientId = getEnv('GOOGLE_CLIENT_ID', null);
if (googleClientId) {
  ssoConfig.google = {
    clientId: googleClientId,
    tokenInfoUrl: getEnv('GOOGLE_TOKEN_INFO_URL', 'https://oauth2.googleapis.com/tokeninfo'),
  };

  clientConfig.sso.google = {
    authUrl: getEnv('GOOGLE_AUTH_URL', 'https://accounts.google.com/o/oauth2/auth'),
    clientId: googleClientId,
  };
}

const githubClientId = getEnv('GITHUB_CLIENT_ID', null);
if (githubClientId) {
  ssoConfig.github = {
    clientId: githubClientId,
    clientSecret: getEnv('GITHUB_CLIENT_SECRET', ''),
    accessTokenUrl: getEnv('GITHUB_ACCESS_TOKEN_URL', 'https://github.com/login/oauth/access_token'),
    userUrl: getEnv('GITHUB_USER_URL', 'https://api.github.com/user'),
  };

  clientConfig.sso.github = {
    authUrl: getEnv('GITHUB_AUTH_URL', 'https://github.com/login/oauth/authorize'),
    clientId: githubClientId,
  };
}

const configMap = new InMemoryMap();
const retroAuthMap = new InMemoryMap();

const hasher = new Hasher(secretPepper, hasherWorkFactor);
const tokenManager = new TokenManager(secretPrivateKeyPassphrase);

export const retroService = new RetroService();
export const retroAuthService = new RetroAuthService(retroAuthMap, hasher, tokenManager);
export const userAuthService = new UserAuthService(tokenManager);

const app = new WebSocketExpress();

app.disable('x-powered-by');
app.enable('case sensitive routing');
app.use(WebSocketExpress.json({ limit: 5 * 1024 }));
app.use('/api', new ApiRouter(userAuthService, retroAuthService, retroService));
app.use('/api/config', new ApiConfigRouter(clientConfig));
app.use('/api/sso', new ApiSsoRouter(userAuthService, ssoConfig));
app.use(new StaticRouter());

userAuthService.initialise(configMap);

configMap.simulatedDelay = 50;
retroAuthMap.simulatedDelay = 50;
retroService.simulatedDelay = 50;
retroService.simulatedSocketDelay = 50;

export default app;
