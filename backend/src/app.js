import WebSocketExpress from 'websocket-express';
import ApiRouter from './routers/ApiRouter';
import StaticRouter from './routers/StaticRouter';
import Hasher from './hash/Hasher';
import TokenManager from './services/TokenManager';
import RetroService from './services/InMemoryRetroService';
import AuthService from './services/InMemoryAuthService';

// environment configuration
const hasherRounds = 10;
const secretPepper = '';
const secretPrivateKeyPassphrase = '';

const hasher = new Hasher(secretPepper, hasherRounds);
const tokenManager = new TokenManager(secretPrivateKeyPassphrase);

export const retroService = new RetroService();
retroService.simulatedDelay = 50;
retroService.simulatedSocketDelay = 50;

export const authService = new AuthService(hasher, tokenManager);
authService.simulatedDelay = 50;

const app = new WebSocketExpress();

app.disable('x-powered-by');
app.enable('case sensitive routing');
app.use(WebSocketExpress.json({ limit: 5 * 1024 }));
app.use('/api', new ApiRouter(authService, retroService));
app.use(new StaticRouter());

export default app;
