import WebSocketExpress, {
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
import { exportRetro, importRetroData, importTimestamp } from '../export/RetroJsonExport';
import { extractExportedRetro } from '../helpers/exportedJsonParsers';
import json from '../helpers/json';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 512;

const JSON_BODY = WebSocketExpress.json({ limit: 512 * 1024 });

const PING = 'P';
const PONG = 'p';

export default class ApiRetrosRouter extends WebSocketExpress.Router {
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

    this.post('/', userAuthMiddleware, JSON_BODY, async (req, res) => {
      try {
        const userId = getAuthData(res).sub!;
        const {
          slug,
          name,
          password,
          importJson,
        } = json.extractObject(req.body, {
          slug: json.string,
          name: json.string,
          password: json.string,
          importJson: json.optional(extractExportedRetro),
        });

        if (!name) {
          throw new Error('No name given');
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
          throw new Error('Password is too short');
        }
        if (password.length > MAX_PASSWORD_LENGTH) {
          throw new Error('Password is too long');
        }

        const id = await retroService.createRetro(userId, slug, name, 'mood');
        await retroAuthService.setPassword(id, password);

        if (importJson) {
          await retroService.updateRetro(id, {
            $merge: importRetroData(importJson.current),
          });

          const archives = importJson.archives || [];

          await Promise.all(archives.map(
            (exportedArchive) => retroArchiveService.createArchive(
              id,
              importRetroData(exportedArchive.snapshot),
              importTimestamp(exportedArchive.created),
            ),
          ));
        }

        const token = await retroAuthService.grantOwnerToken(id);

        res.status(200).json({ id, token });
      } catch (e) {
        if (e.message === 'URL is already taken') {
          res.status(409).json({ error: e.message });
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

      const onChange = (msg: ChangeInfo, id?: number): void => {
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
        if (msg === PING) {
          ws.send(PONG);
          return;
        }
        if (!hasAuthScope(res, 'write')) {
          res.sendError(403);
          return;
        }
        const message = json.parse(msg, json.object({
          change: json.record,
          id: json.optional(json.number),
        }));
        subscription.send(message.change, message.id);
      });

      ws.send(JSON.stringify({
        change: { $set: subscription.getInitialData() },
      }));
    });

    this.get(
      '/:retroId/export/json',
      requireAuthScope('read'),
      requireAuthScope('readArchives'),
      async (req, res) => {
        const { retroId } = req.params;

        const retro = await retroService.getRetro(retroId);
        if (!retro) {
          res.status(404).end();
          return;
        }

        const archives = await retroArchiveService.getRetroArchiveList(retroId);
        const fileName = `${retro.slug}-export.json`;

        const data = exportRetro(retro, archives);
        res.header('content-disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
        res.header('content-type', 'application/json; charset=utf-8');
        res.send(JSON.stringify(data, null, 2)).end();
      },
    );

    this.use('/:retroId/archives', new ApiRetroArchivesRouter(
      retroArchiveService,
    ));
  }
}
