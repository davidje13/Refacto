import { join } from 'node:path';
import {
  CONTINUE,
  fileServer,
  findCause,
  HTTPError,
  jsonErrorHandler,
  makeGetClient,
  negotiateEncoding,
  Negotiator,
  proxy,
  Router,
  typedErrorHandler,
  WebListener,
} from 'web-listener';
import { Hasher } from 'pwd-hasher';
import { CollectionStorage } from 'collection-storage';
import { ApiSpecRouter } from './routers/ApiSpecRouter';
import { ApiConfigRouter } from './routers/ApiConfigRouter';
import { ApiDiagnosticsRouter } from './routers/ApiDiagnosticsRouter';
import { ApiAuthRouter } from './routers/ApiAuthRouter';
import { ApiSlugsRouter } from './routers/ApiSlugsRouter';
import { ApiRetrosRouter } from './routers/ApiRetrosRouter';
import { ApiPasswordCheckRouter } from './routers/ApiPasswordCheckRouter';
import { ApiGiphyRouter } from './routers/ApiGiphyRouter';
import { setCacheHeaders } from './routers/StaticRouter';
import { TokenManager } from './tokens/TokenManager';
import { PasswordCheckService } from './services/PasswordCheckService';
import type { Logger } from './services/LogService';
import { GiphyService } from './services/GiphyService';
import { RetroService } from './services/RetroService';
import { RetroArchiveService } from './services/RetroArchiveService';
import { RetroAuthService, ScopesError } from './services/RetroAuthService';
import { UserAuthService } from './services/UserAuthService';
import { AnalyticsService } from './services/AnalyticsService';
import { getAuthBackend } from './auth';
import type { ConfigT } from './config';
import { basedir } from './basedir';
import {
  addNoCacheHeaders,
  addSecurityHeaders,
  removeHtmlSecurityHeaders,
} from './headers';
import { ValidationError } from './helpers/json';

export interface TestHooks {
  retroService: RetroService;
  retroArchiveService: RetroArchiveService;
  retroAuthService: RetroAuthService;
  userAuthService: UserAuthService;
}

export class App {
  constructor(
    public readonly listener: WebListener,
    public readonly testHooks: TestHooks,
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

export const appFactory = async (
  logger: Logger,
  config: ConfigT,
): Promise<App> => {
  const db = await CollectionStorage.connect(config.db.url);

  const passwordRequirements = { minLength: 8, maxLength: 512 };
  const hasher = new Hasher(config.password);
  const tokenManager = new TokenManager(config.token);

  const encryptionKey = readKey(config.encryption.secretKey, 32);

  const analyticsService = new AnalyticsService(
    logger,
    readEnum(config.analytics.eventDetail, DETAIL_LEVEL),
    readEnum(config.analytics.clientErrorDetail, DETAIL_LEVEL),
  );
  const passwordCheckService = new PasswordCheckService(config.passwordCheck);
  const giphyService = new GiphyService(config.giphy);
  const retroService = new RetroService(db, encryptionKey);
  const retroArchiveService = new RetroArchiveService(db, encryptionKey);
  const retroAuthService = new RetroAuthService(db, hasher, tokenManager, {
    ownerTokenLifespan: 60 * 60 * 24 * 30 * 6,
    passwordTokenLifespan: 60 * 60 * 24 * 30 * 6,
    keyTokenLifespan: 60 * 60,
    retroApiKeyLimit: config.permit.retroApiKeys,
  });
  const userAuthService = new UserAuthService(tokenManager);
  await userAuthService.initialise(db);

  const auth = getAuthBackend(config, userAuthService);

  const app = new Router();

  const getClient = makeGetClient({
    trustedProxyCount: config.trustProxy ? 1 : 0,
    trustedHeaders: ['x-forwarded-for', 'x-forwarded-host'],
  });

  app.use((req, res) => {
    addSecurityHeaders(req, res, getClient);
    return CONTINUE;
  });

  app.mount('/api', new ApiSpecRouter());

  app.mount('/api', (_, res) => {
    removeHtmlSecurityHeaders(res);
    addNoCacheHeaders(res);
    return CONTINUE;
  });

  app.get('/api/health', (_, res) => res.end('OK'));
  app.mount(
    '/api/auth',
    new ApiAuthRouter(
      userAuthService,
      retroAuthService,
      retroService,
      analyticsService,
      config.permit.myRetros,
    ),
  );
  app.mount('/api/diagnostics', new ApiDiagnosticsRouter(analyticsService));
  app.mount('/api/slugs', new ApiSlugsRouter(retroService));
  app.mount(
    '/api/config',
    new ApiConfigRouter(config, auth.clientConfig, passwordRequirements),
  );
  auth.addRoutes(app);
  app.mount(
    '/api/retros',
    new ApiRetrosRouter(
      userAuthService,
      retroAuthService,
      retroService,
      retroArchiveService,
      analyticsService,
      config.permit.myRetros,
      passwordRequirements,
    ),
  );
  app.mount(
    '/api/password-check',
    new ApiPasswordCheckRouter(passwordCheckService),
  );
  app.mount('/api/giphy', new ApiGiphyRouter(giphyService, analyticsService));
  app.mount(
    '/api',
    (_, res) => res.writeHead(404).end(),
    typedErrorHandler(ValidationError, (error) => {
      throw new HTTPError(422, { body: error.message, cause: error });
    }),
    typedErrorHandler(ScopesError, (error) => {
      throw new HTTPError(403, { body: error.message, cause: error });
    }),
    jsonErrorHandler((error) => ({ error: error.body }), {
      onlyIfRequested: false,
    }),
  );

  if (config.forwardHost) {
    // Dev mode: forward unknown requests to another service
    app.use(proxy(config.forwardHost, { keepAlive: true, maxSockets: 10 }));
  } else {
    // Production mode: all resources are copied into /static
    app.use(
      await fileServer(join(basedir, 'static'), {
        mode: 'static-paths',
        negotiator: new Negotiator([negotiateEncoding(['br', 'gzip'])]),
        fallback: { filePath: 'index.html' }, // Single page app: serve index.html for any unknown GET request
        hide: [/\.(br|gz)^/],
        callback: setCacheHeaders,
      }),
    );
  }

  const listener = new WebListener(app);
  listener.addEventListener('error', (evt) => {
    evt.preventDefault();
    const { request, context, error } = evt.detail;
    if (!request) {
      logger.error(error, { context });
    } else if ((findCause(error, HTTPError)?.statusCode ?? 500) >= 500) {
      analyticsService.requestError(request, context, error);
    }
  });

  return new App(
    listener,
    {
      retroService,
      retroArchiveService,
      retroAuthService,
      userAuthService,
    },
    db.close.bind(db),
  );
};
