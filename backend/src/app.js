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

export default async (config) => {
  const configMap = new InMemoryMap(config.mock.ioDelay);
  const retroAuthMap = new InMemoryMap(config.mock.ioDelay);

  const hasher = new Hasher(config.password);
  const tokenManager = new TokenManager(config.token);

  const retroService = new RetroService(
    config.mock.ioDelay,
    config.mock.streamDelay,
  );
  const retroAuthService = new RetroAuthService(
    retroAuthMap,
    hasher,
    tokenManager,
  );
  const userAuthService = new UserAuthService(tokenManager);

  const app = new WebSocketExpress();

  app.disable('x-powered-by');
  app.enable('case sensitive routing');
  app.use(WebSocketExpress.json({ limit: 5 * 1024 }));

  app.use('/api', new ApiRouter(userAuthService, retroAuthService, retroService));
  app.use('/api/config', new ApiConfigRouter(config));
  app.use('/api/sso', new ApiSsoRouter(userAuthService, config.sso));
  app.use(new StaticRouter(config.forwardHost));

  await userAuthService.initialise(configMap);

  app.testHooks = {
    retroService,
    retroAuthService,
    userAuthService,
  };

  return app;
};
