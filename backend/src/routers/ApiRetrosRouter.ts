import {
  Router,
  requireBearerAuth,
  requireAuthScope,
  getAuthData,
  hasAuthScope,
  JWTPayload,
} from 'websocket-express';
import ApiRetroArchivesRouter from './ApiRetroArchivesRouter';
import UserAuthService from '../services/UserAuthService';
import RetroAuthService from '../services/RetroAuthService';
import RetroService, { ChangeInfo } from '../services/RetroService';
import RetroArchiveService from '../services/RetroArchiveService';
import json from '../helpers/json';

const VALID_SLUG = /^[a-z0-9][a-z0-9_-]*$/;
const MIN_PASSWORD_LENGTH = 8;

export default class ApiRetrosRouter extends Router {
  public constructor(
    userAuthService: UserAuthService,
    retroAuthService: RetroAuthService,
    retroService: RetroService,
    retroArchiveService: RetroArchiveService,
  ) {
    super();

    const userAuthMiddleware = requireBearerAuth(
      'user',
      (token): (JWTPayload | null) => userAuthService.readAndVerifyToken(token),
    );

    this.get('/', userAuthMiddleware, async (req, res) => {
      const userId = getAuthData(res).sub!;

      res.json({
        retros: await retroService.getRetroListForUser(userId),
      });
    });

    this.post('/', userAuthMiddleware, async (req, res) => {
      try {
        const userId = getAuthData(res).sub!;
        const { slug, name, password } = json.extractObject(req.body, {
          slug: json.string,
          name: json.string,
          password: json.string,
        });

        if (!name) {
          throw new Error('No name given');
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
          throw new Error('Password is too short');
        }
        if (!VALID_SLUG.test(slug)) {
          throw new Error('Invalid URL');
        }

        const id = await retroService.createRetro(userId, slug, name, 'mood');
        await retroAuthService.setPassword(id, password);

        res.status(200).json({ id });
      } catch (e) {
        if (e.message === 'slug exists') {
          res.status(409).json({ error: 'URL is already taken' });
        } else {
          res.status(400).json({ error: e.message });
        }
      }
    });

    this.use('/:retroId', requireBearerAuth(
      (req) => req.params.retroId,
      (token, realm) => retroAuthService.readAndVerifyToken(realm, token),
    ));

    this.ws('/:retroId', requireAuthScope('read'), async (req, res) => {
      const { retroId } = req.params;
      const ws = await res.accept();

      const onChange = (msg: ChangeInfo, id?: string): void => {
        const data = (id !== undefined) ? { id, ...msg } : msg;
        ws.send(JSON.stringify(data));
      };

      const subscription = await retroService.subscribeRetro(retroId, onChange);

      if (!subscription) {
        res.sendError(404);
        return;
      }

      ws.on('close', subscription.close);

      ws.on('message', (msg: string) => {
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
