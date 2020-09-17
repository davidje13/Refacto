import WebSocketExpress from 'websocket-express';
import CollectionStorage from 'collection-storage';
import Hasher from 'pwd-hasher';
import {
  TrackingTopicMap,
  InMemoryTopic,
  Topic,
  TopicMessage,
} from 'shared-reducer-backend';
import { buildAuthenticationBackend } from 'authentication-backend';
import type { Retro } from 'refacto-entities';
import ApiConfigRouter from './routers/ApiConfigRouter';
import ApiAuthRouter from './routers/ApiAuthRouter';
import ApiSlugsRouter from './routers/ApiSlugsRouter';
import ApiRetrosRouter from './routers/ApiRetrosRouter';
import ApiPasswordCheckRouter from './routers/ApiPasswordCheckRouter';
import ApiGiphyRouter from './routers/ApiGiphyRouter';
import StaticRouter from './routers/StaticRouter';
import { TokenManager } from './tokens/TokenManager';
import PasswordCheckService from './services/PasswordCheckService';
import GiphyService from './services/GiphyService';
import RetroService from './services/RetroService';
import RetroArchiveService from './services/RetroArchiveService';
import RetroAuthService from './services/RetroAuthService';
import UserAuthService from './services/UserAuthService';
import type { ConfigT } from './config';

export interface TestHooks {
  retroService: RetroService;
  retroArchiveService: RetroArchiveService;
  retroAuthService: RetroAuthService;
  userAuthService: UserAuthService;
}

interface TestHookWebSocketExpress extends WebSocketExpress {
  testHooks: TestHooks;
}

const devMode = process.env.NODE_ENV === 'development';

const CSP_DOMAIN_PLACEHOLDER = /\(domain\)/g;
const CSP = [
  "base-uri 'self'",
  "default-src 'self'",
  "object-src 'none'",
  `script-src 'self'${devMode ? " 'unsafe-eval'" : ''}`,
  `style-src 'self'${devMode ? " 'unsafe-inline'" : " 'sha256-dhQFgDyZCSW+FVxPjFWZQkEnh+5DHADvj1I8rpzmaGU='"}`,
  // https://github.com/w3c/webappsec-csp/issues/7
  `connect-src 'self' wss://(domain)${devMode ? ' ws://(domain)' : ''}`,
  "img-src 'self' data: https://*.giphy.com",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

function getHost(req: { hostname: string }): string {
  const raw: string = req.hostname;
  if (raw.includes(':')) {
    return raw;
  }
  // Bug in express 4.x: hostname does not include port
  // fixed in 5, but not released yet
  // https://expressjs.com/en/guide/migrating-5.html#req.host
  return `${raw}:*`;
}

function readKey(value: string, length: number): Buffer {
  if (!value) {
    return Buffer.alloc(length);
  }
  const buffer = Buffer.from(value, 'hex');
  if (buffer.length !== length) {
    throw new Error(`Invalid key size; expected ${length} bytes`);
  }
  return buffer;
}

export default async (config: ConfigT): Promise<TestHookWebSocketExpress> => {
  const db = await CollectionStorage.connect(config.db.url);

  const hasher = new Hasher(config.password);
  const tokenManager = new TokenManager(config.token);

  const retroChangeSubs = new TrackingTopicMap(
    (): Topic<TopicMessage<Retro>> => new InMemoryTopic(),
  );

  const encryptionKey = readKey(config.encryption.secretKey, 32);

  const passwordCheckService = new PasswordCheckService(config.passwordCheck);
  const giphyService = new GiphyService(config.giphy);
  const retroService = new RetroService(db, encryptionKey, retroChangeSubs);
  const retroArchiveService = new RetroArchiveService(db, encryptionKey);
  const retroAuthService = new RetroAuthService(db, hasher, tokenManager);
  const userAuthService = new UserAuthService(tokenManager);
  await userAuthService.initialise(db);

  const sso = buildAuthenticationBackend(
    config.sso,
    userAuthService.grantLoginToken,
  );

  const app = new WebSocketExpress();

  app.disable('x-powered-by');
  app.enable('case sensitive routing');
  if (config.trustProxy) {
    app.enable('trust proxy');
  }
  app.set('shutdown timeout', 5000);

  app.useHTTP((req, res, next) => {
    res.header('x-frame-options', 'DENY');
    res.header('x-xss-protection', '1; mode=block');
    res.header('x-content-type-options', 'nosniff');
    res.header('content-security-policy', CSP
      .replace(CSP_DOMAIN_PLACEHOLDER, getHost(req)));
    res.header('referrer-policy', 'no-referrer');
    res.header('cross-origin-opener-policy', 'same-origin');
    res.header('cross-origin-embedder-policy', 'require-corp');
    next();
  });

  app.useHTTP('/api', (req, res, next) => {
    res.header('cache-control', 'no-cache, no-store');
    res.header('expires', '0');
    res.header('pragma', 'no-cache');
    res.removeHeader('content-security-policy');
    res.removeHeader('cross-origin-opener-policy');
    res.removeHeader('cross-origin-embedder-policy');
    next();
  });

  app.use('/api/auth', new ApiAuthRouter(
    userAuthService,
    retroAuthService,
    retroService,
  ));
  app.use('/api/slugs', new ApiSlugsRouter(retroService));
  app.use('/api/config', new ApiConfigRouter(config, sso.service.clientConfig));
  app.useHTTP('/api/sso', sso.router);
  app.use('/api/retros', new ApiRetrosRouter(
    userAuthService,
    retroAuthService,
    retroService,
    retroArchiveService,
  ));
  app.use('/api/password-check', new ApiPasswordCheckRouter(passwordCheckService));
  app.use('/api/giphy', new ApiGiphyRouter(giphyService));
  app.useHTTP('/api', (req, res) => {
    res.status(404).send();
  });
  app.use(new StaticRouter(config.forwardHost));

  const testHookApp = app as TestHookWebSocketExpress;
  testHookApp.testHooks = {
    retroService,
    retroArchiveService,
    retroAuthService,
    userAuthService,
  };

  return testHookApp;
};
