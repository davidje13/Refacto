import { join } from 'node:path';
import type { ErrorRequestHandler } from 'express';
import { WebSocketExpress } from 'websocket-express';
import { connectDB } from './import-wrappers/collection-storage-wrap';
import { Hasher } from 'pwd-hasher';
import { ApiConfigRouter } from './routers/ApiConfigRouter';
import { ApiDiagnosticsRouter } from './routers/ApiDiagnosticsRouter';
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
import { AnalyticsService } from './services/AnalyticsService';
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

function readEnum<T extends string>(value: string, options: readonly T[]): T {
  if (options.includes(value as T)) {
    return value as T;
  }
  throw new Error(
    `invalid value ${value} (permitted options: ${options.join(' / ')})`,
  );
}

const DETAIL_LEVEL = ['version', 'brand', 'message', 'none'] as const;

export const appFactory = async (config: ConfigT): Promise<App> => {
  const db = await connectDB(config.db.url);

  const hasher = new Hasher(config.password);
  const tokenManager = new TokenManager(config.token);

  const encryptionKey = readKey(config.encryption.secretKey, 32);

  const analyticsService = new AnalyticsService(
    readEnum(config.analytics.eventDetail, DETAIL_LEVEL),
    readEnum(config.analytics.clientErrorDetail, DETAIL_LEVEL),
  );
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
    new ApiAuthRouter(
      userAuthService,
      retroAuthService,
      retroService,
      analyticsService,
      config.permit.myRetros,
    ),
  );
  app.use('/api/diagnostics', new ApiDiagnosticsRouter(analyticsService));
  app.use('/api/slugs', new ApiSlugsRouter(retroService));
  app.use('/api/config', new ApiConfigRouter(config, auth.clientConfig));
  auth.addRoutes(app);
  const apiRetrosRouter = new ApiRetrosRouter(
    userAuthService,
    retroAuthService,
    retroService,
    retroArchiveService,
    analyticsService,
    config.permit.myRetros,
  );
  app.use('/api/retros', apiRetrosRouter);
  app.use(
    '/api/password-check',
    new ApiPasswordCheckRouter(passwordCheckService, analyticsService),
  );
  app.use('/api/giphy', new ApiGiphyRouter(giphyService, analyticsService));
  app.useHTTP('/api', (_, res) => {
    res.status(404).send();
  });
  if (config.forwardHost) {
    // Dev mode: forward unknown requests to another service
    app.use(await ForwardingRouter.to(config.forwardHost, analyticsService));
  } else {
    // Production mode: all resources are copied into /static
    app.use(new StaticRouter(join(basedir, 'static')));
  }

  // error handler must have all 4 parameters listed to be recognised by express
  const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
    analyticsService.requestError(req, 'Unhandled route error', err);
    res.status(500).json({ error: 'internal error' });
  };
  app.use(errorHandler);

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
