import WebSocketExpress, { Router } from 'websocket-express';
import CollectionStorage from 'collection-storage';
import ApiConfigRouter from './routers/ApiConfigRouter';
import ApiAuthRouter from './routers/ApiAuthRouter';
import ApiSlugsRouter from './routers/ApiSlugsRouter';
import ApiSsoRouter from './routers/ApiSsoRouter';
import ApiRetrosRouter from './routers/ApiRetrosRouter';
import StaticRouter from './routers/StaticRouter';
import Hasher from './hash/Hasher';
import TokenManager from './tokens/TokenManager';
import SsoService from './services/SsoService';
import RetroService, { TopicMessage } from './services/RetroService';
import RetroArchiveService from './services/RetroArchiveService';
import RetroAuthService from './services/RetroAuthService';
import UserAuthService from './services/UserAuthService';
import InMemoryTopic from './queue/InMemoryTopic';
import TrackingTopicMap from './queue/TrackingTopicMap';
import { ConfigT } from './config';

export default async (config: ConfigT): Promise<WebSocketExpress> => {
  const db = await CollectionStorage.connect(config.db.url);

  const hasher = new Hasher(config.password);
  const tokenManager = new TokenManager(config.token);

  const retroChangeSubs = new TrackingTopicMap(
    (): InMemoryTopic<TopicMessage> => new InMemoryTopic<TopicMessage>(),
  );

  const ssoService = new SsoService(config.sso);
  const retroService = new RetroService(db, retroChangeSubs);
  const retroArchiveService = new RetroArchiveService(db);
  const retroAuthService = new RetroAuthService(db, hasher, tokenManager);
  const userAuthService = new UserAuthService(tokenManager);
  await userAuthService.initialise(db);

  const app = new WebSocketExpress();

  app.disable('x-powered-by');
  app.enable('case sensitive routing');
  app.use(WebSocketExpress.json({ limit: 5 * 1024 }));

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
  app.use(new StaticRouter(config.forwardHost) as Router);

  (app as any).testHooks = {
    retroService,
    retroArchiveService,
    retroAuthService,
    userAuthService,
  };

  return app;
};
