import WebSocketExpress from 'websocket-express';
import CollectionStorage from 'collection-storage';
import Hasher from 'pwd-hasher';
import ApiConfigRouter from './routers/ApiConfigRouter';
import ApiAuthRouter from './routers/ApiAuthRouter';
import ApiSlugsRouter from './routers/ApiSlugsRouter';
import ApiSsoRouter from './routers/ApiSsoRouter';
import ApiRetrosRouter from './routers/ApiRetrosRouter';
import ApiPasswordCheckRouter from './routers/ApiPasswordCheckRouter';
import ApiGiphyRouter from './routers/ApiGiphyRouter';
import StaticRouter from './routers/StaticRouter';
import TokenManager from './tokens/TokenManager';
import PasswordCheckService from './services/PasswordCheckService';
import GiphyService from './services/GiphyService';
import SsoService from './services/SsoService';
import RetroService, { TopicMessage } from './services/RetroService';
import RetroArchiveService from './services/RetroArchiveService';
import RetroAuthService from './services/RetroAuthService';
import UserAuthService from './services/UserAuthService';
import InMemoryTopic from './queue/InMemoryTopic';
import Topic from './queue/Topic';
import TrackingTopicMap from './queue/TrackingTopicMap';
import { ConfigT } from './config';

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
  'base-uri \'self\'',
  'default-src \'self\'',
  'object-src \'none\'',
  `script-src 'self'${devMode ? ' \'unsafe-eval\'' : ''}`,
  `style-src 'self'${devMode ? ' \'unsafe-inline\'' : ''}`,
  'font-src \'self\'',
  // https://github.com/w3c/webappsec-csp/issues/7
  `connect-src 'self' wss://(domain)${devMode ? ' ws://(domain)' : ''}`,
  'img-src \'self\' data: https://*.giphy.com',
  'form-action \'none\'',
].join('; ');

function getHost(req: any): string {
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
    (): Topic<TopicMessage> => new InMemoryTopic<TopicMessage>(),
  );

  const encryptionKey = readKey(config.encryption.secretKey, 32);

  const passwordCheckService = new PasswordCheckService(config.passwordCheck);
  const giphyService = new GiphyService(config.giphy);
  const ssoService = new SsoService(config.sso);
  const retroService = new RetroService(db, encryptionKey, retroChangeSubs);
  const retroArchiveService = new RetroArchiveService(db, encryptionKey);
  const retroAuthService = new RetroAuthService(db, hasher, tokenManager);
  const userAuthService = new UserAuthService(tokenManager);
  await userAuthService.initialise(db);

  const app = new WebSocketExpress();

  app.disable('x-powered-by');
  app.enable('case sensitive routing');
  if (config.trustProxy) {
    app.enable('trust proxy');
  }

  app.useHTTP((req, res, next) => {
    res.header('x-frame-options', 'DENY');
    res.header('x-xss-protection', '1; mode=block');
    res.header('x-content-type-options', 'nosniff');
    res.header('content-security-policy', CSP
      .replace(CSP_DOMAIN_PLACEHOLDER, getHost(req)));
    res.header('referrer-policy', 'no-referrer');
    next();
  });

  app.useHTTP('/api', (req, res, next) => {
    res.header('cache-control', 'no-cache, no-store');
    res.header('expires', '0');
    res.header('pragma', 'no-cache');
    res.removeHeader('content-security-policy');
    next();
  });

  app.use('/api/auth', new ApiAuthRouter(retroAuthService));
  app.use('/api/slugs', new ApiSlugsRouter(retroService));
  app.use('/api/config', new ApiConfigRouter(config));
  app.use('/api/sso', new ApiSsoRouter(userAuthService, ssoService));
  app.use('/api/retros', new ApiRetrosRouter(
    userAuthService,
    retroAuthService,
    retroService,
    retroArchiveService,
  ));
  app.use('/api/password-check', new ApiPasswordCheckRouter(passwordCheckService));
  app.use('/api/giphy', new ApiGiphyRouter(giphyService));
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
