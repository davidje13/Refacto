import {
  Router,
  requireBearerAuth,
  requireAuthScope,
  getAuthData,
  hasAuthScope,
} from 'websocket-express';
import ApiRetroArchivesRouter from './ApiRetroArchivesRouter';

const VALID_SLUG = /^[a-z0-9][a-z0-9_-]*$/;
const MIN_PASSWORD_LENGTH = 8;

export default class ApiRetrosRouter extends Router {
  constructor(
    userAuthService,
    retroAuthService,
    retroService,
    retroArchiveService,
  ) {
    super();

    const userAuthMiddleware = requireBearerAuth(
      'user',
      (token) => userAuthService.readAndVerifyToken(token),
    );

    this.get('/', userAuthMiddleware, async (req, res) => {
      const userId = getAuthData(res).sub;

      res.json({
        retros: await retroService.getRetroListForUser(userId),
      });
    });

    this.post('/', userAuthMiddleware, async (req, res) => {
      const userId = getAuthData(res).sub;
      const { slug, name, password } = req.body;

      if (!name || typeof name !== 'string') {
        res.status(400).json({ error: 'No name given' });
        return;
      }
      if (!password || typeof password !== 'string') {
        res.status(400).json({ error: 'No password given' });
        return;
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        res.status(400).json({ error: 'Password is too short' });
        return;
      }
      if (!slug || typeof slug !== 'string' || !VALID_SLUG.test(slug)) {
        res.status(400).json({ error: 'Invalid URL' });
        return;
      }

      try {
        const id = await retroService.createRetro(userId, slug, name, 'mood');
        await retroAuthService.setPassword(id, password);

        res.status(200).json({ id });
      } catch (e) {
        if (e.message === 'slug exists') {
          res.status(409).json({ error: 'URL is already taken' });
          return;
        }
        throw e;
      }
    });

    this.use('/:retroId', requireBearerAuth(
      (req) => req.params.retroId,
      (token, realm) => retroAuthService.readAndVerifyToken(realm, token),
    ));

    this.ws('/:retroId', requireAuthScope('read'), async (req, res) => {
      const { retroId } = req.params;
      const ws = await res.accept();

      const onChange = (msg, id) => {
        const message = Object.assign({}, msg);
        if (id !== undefined) {
          message.id = id;
        }
        ws.send(JSON.stringify(message));
      };

      const subscription = await retroService.subscribeRetro(retroId, onChange);

      if (!subscription) {
        res.sendError(404);
        return;
      }

      ws.on('close', subscription.close);

      ws.on('message', (msg) => {
        const { change, id } = JSON.parse(msg);
        if (!hasAuthScope(res, 'write')) {
          res.sendError(403);
          return;
        }
        subscription.send(change, id);
      });

      ws.send(JSON.stringify({
        change: { $set: subscription.getInitialData() },
      }));
    });

    this.use('/:retroId/archives', new ApiRetroArchivesRouter(
      retroArchiveService,
    ));
  }
}
