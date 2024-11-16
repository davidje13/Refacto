import { join } from 'node:path';
import { WebSocketExpress } from 'websocket-express';
import { connectDB } from './import-wrappers/collection-storage-wrap';
import { Hasher } from 'pwd-hasher';
import { ApiConfigRouter } from './routers/ApiConfigRouter';
import { ApiAuthRouter } from './routers/ApiAuthRouter';
import { ApiSlugsRouter } from './routers/ApiSlugsRouter';
import { ApiRetrosRouter } from './routers/ApiRetrosRouter';
import { ApiPasswordCheckRouter } from './routers/ApiPasswordCheckRouter';
import { ApiGiphyRouter } from './routers/ApiGiphyRouter';
import { ForwardingRouter } from './routers/ForwardingRouter';
import { StaticRouter } from './routers/StaticRouter';
import { TokenManager } from './tokens/TokenManager';
import { PasswordCheckService } from './services/PasswordCheckService';
import { GiphyService } from './services/GiphyService';
import { RetroService } from './services/RetroService';
import { RetroArchiveService } from './services/RetroArchiveService';
import { RetroAuthService } from './services/RetroAuthService';
import { UserAuthService } from './services/UserAuthService';
import { getAuthBackend } from './auth';
import { type ConfigT } from './config';
import { basedir } from './basedir';
import {
  addNoCacheHeaders,
  addSecurityHeaders,
  removeHtmlSecurityHeaders,
} from './headers';

export interface TestHooks {
  retroService: RetroService;
  retroArchiveService: RetroArchiveService;
  retroAuthService: RetroAuthService;
  userAuthService: UserAuthService;
}

export class App {
  constructor(
    public readonly express: WebSocketExpress,
    public readonly testHooks: TestHooks,
    public readonly softClose: (timeout: number) => void | Promise<void>,
    public readonly close: () => void | Promise<void>,
  ) {}
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

export const appFactory = async (config: ConfigT): Promise<App> => {
  const db = await connectDB(config.db.url);

  const hasher = new Hasher(config.password);
  const tokenManager = new TokenManager(config.token);

  const encryptionKey = readKey(config.encryption.secretKey, 32);

  const passwordCheckService = new PasswordCheckService(config.passwordCheck);
  const giphyService = new GiphyService(config.giphy);
  const retroService = new RetroService(db, encryptionKey);
  const retroArchiveService = new RetroArchiveService(db, encryptionKey);
  const retroAuthService = new RetroAuthService(db, hasher, tokenManager);
  const userAuthService = new UserAuthService(tokenManager);
  await userAuthService.initialise(db);

  const auth = getAuthBackend(config, userAuthService);

  const app = new WebSocketExpress();

  app.disable('x-powered-by');
  app.enable('case sensitive routing');
  if (config.trustProxy) {
    app.enable('trust proxy');
  }
  app.set('shutdown timeout', 5000);

  app.useHTTP((req, res, next) => {
    addSecurityHeaders(req, res);
    next();
  });

  app.useHTTP('/api', (_, res, next) => {
    removeHtmlSecurityHeaders(res);
    addNoCacheHeaders(res);
    next();
  });

  app.use(
    '/api/auth',
    new ApiAuthRouter(userAuthService, retroAuthService, retroService),
  );
  app.use('/api/slugs', new ApiSlugsRouter(retroService));
  app.use('/api/config', new ApiConfigRouter(config, auth.clientConfig));
  auth.addRoutes(app);
  const apiRetrosRouter = new ApiRetrosRouter(
    userAuthService,
    retroAuthService,
    retroService,
    retroArchiveService,
  );
  app.use('/api/retros', apiRetrosRouter);
  app.use(
    '/api/password-check',
    new ApiPasswordCheckRouter(passwordCheckService),
  );
  app.use('/api/giphy', new ApiGiphyRouter(giphyService));
  app.useHTTP('/api', (_, res) => {
    res.status(404).send();
  });
  if (config.forwardHost) {
    // Dev mode: forward unknown requests to another service
    app.use(await ForwardingRouter.to(config.forwardHost));
  } else {
    // Production mode: all resources are copied into /static
    app.use(new StaticRouter(join(basedir, 'static')));
  }

  return new App(
    app,
    {
      retroService,
      retroArchiveService,
      retroAuthService,
      userAuthService,
    },
    apiRetrosRouter.softClose,
    db.close.bind(db),
  );
};
