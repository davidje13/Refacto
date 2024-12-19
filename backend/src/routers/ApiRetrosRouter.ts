import { WebSocketExpress, Router, type JWTPayload } from 'websocket-express';
import { WebsocketHandlerFactory } from 'shared-reducer/backend';
import { ApiRetroArchivesRouter } from './ApiRetroArchivesRouter';
import { type UserAuthService } from '../services/UserAuthService';
import { type RetroAuthService } from '../services/RetroAuthService';
import { type RetroService } from '../services/RetroService';
import { type RetroArchiveService } from '../services/RetroArchiveService';
import {
  exportRetroJson,
  importRetroDataJson,
  importTimestamp,
} from '../export/RetroJsonExport';
import { extractExportedRetro } from '../helpers/exportedJsonParsers';
import { json } from '../helpers/json';
import { safe } from '../helpers/routeHelpers';
import { logError } from '../log';
import { JSONFormatter } from '../export/JSONFormatter';
import { CSVFormatter } from '../export/CSVFormatter';
import { exportRetroTable } from '../export/RetroTableExport';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 512;

const JSON_BODY = WebSocketExpress.json({ limit: 512 * 1024 });

const formattedJSON = JSONFormatter.Builder().withIndent(2).build();

const formattedCSV = new CSVFormatter();

export class ApiRetrosRouter extends Router {
  public readonly softClose: (timeout: number) => Promise<void>;

  public constructor(
    userAuthService: UserAuthService,
    retroAuthService: RetroAuthService,
    retroService: RetroService,
    retroArchiveService: RetroArchiveService,
  ) {
    super();

    const userAuthMiddleware = WebSocketExpress.requireBearerAuth(
      'user',
      (token): JWTPayload | null => userAuthService.readAndVerifyToken(token),
    );

    const wsHandlerFactory = new WebsocketHandlerFactory(
      retroService.retroBroadcaster,
      { pongTimeout: 60_000 },
    );
    this.softClose = (timeout) => wsHandlerFactory.softClose(timeout);

    this.get(
      '/',
      userAuthMiddleware,
      safe(async (_, res) => {
        const userId = WebSocketExpress.getAuthData(res).sub!;

        res.json({
          retros: await retroService.getRetroListForUser(userId),
        });
      }),
    );

    this.post('/', userAuthMiddleware, JSON_BODY, async (req, res) => {
      try {
        const userId = WebSocketExpress.getAuthData(res).sub!;
        const { slug, name, password, importJson } = json.extractObject(
          req.body,
          {
            slug: json.string,
            name: json.string,
            password: json.string,
            importJson: json.optional(extractExportedRetro),
          },
        );

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
          await retroService.retroBroadcaster.update(id, [
            'merge',
            importRetroDataJson(importJson.current),
          ]);

          const archives = importJson.archives || [];

          await Promise.all(
            archives.map((exportedArchive) =>
              retroArchiveService.createArchive(
                id,
                importRetroDataJson(exportedArchive.snapshot),
                importTimestamp(exportedArchive.created),
              ),
            ),
          );
        }

        const token = await retroAuthService.grantOwnerToken(id);

        res.status(200).json({ id, token });
      } catch (e) {
        if (!(e instanceof Error)) {
          logError('Unexpected error creating retro', e);
          res.status(500).json({ error: 'Internal error' });
        } else if (e.message === 'URL is already taken') {
          res.status(409).json({ error: e.message });
        } else {
          res.status(400).json({ error: e.message });
        }
      }
    });

    this.use(
      '/:retroId',
      WebSocketExpress.requireBearerAuth(
        (req) => req.params['retroId'] ?? '',
        (token, realm) => retroAuthService.readAndVerifyToken(realm, token),
      ),
    );

    this.ws(
      '/:retroId',
      WebSocketExpress.requireAuthScope('read'),
      wsHandlerFactory.handler(
        (req) => req.params.retroId,
        (_, res) =>
          retroService.getPermissions(
            WebSocketExpress.hasAuthScope(res, 'write'),
          ),
      ),
    );

    this.get(
      '/:retroId/export/:format',
      WebSocketExpress.requireAuthScope('read'),
      WebSocketExpress.requireAuthScope('readArchives'),
      safe(async (req, res) => {
        const { retroId, format } = req.params;

        const retro = await retroService.getRetro(retroId);
        if (!retro) {
          res.status(404).end();
          return;
        }

        const archives = await retroArchiveService.getRetroArchiveList(retroId);

        switch (format) {
          case 'json': {
            res.header(
              'content-disposition',
              `attachment; filename="${encodeURIComponent(`${retro.slug}-export.json`)}"`,
            );
            res.header('content-type', 'application/json; charset=utf-8');
            await formattedJSON.stream(res, exportRetroJson(retro, archives));
            res.end();
            break;
          }
          case 'csv': {
            res.header(
              'content-disposition',
              `attachment; filename="${encodeURIComponent(`${retro.slug}-export.csv`)}"`,
            );
            res.header(
              'content-type',
              'text/csv; charset=utf-8; header=present',
            );
            await formattedCSV.stream(res, exportRetroTable(retro, archives));
            res.end();
            break;
          }
          default:
            res.status(404).end();
            break;
        }
      }),
    );

    this.use(
      '/:retroId/archives',
      new ApiRetroArchivesRouter(retroArchiveService),
    );
  }
}
