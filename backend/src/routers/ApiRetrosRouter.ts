import {
  getBodyJson,
  getPathParameter,
  getPathParameters,
  hasAuthScope,
  HTTPError,
  makeAcceptWebSocket,
  makeWebSocketFallbackTokenFetcher,
  requireAuthScope,
  requireBearerAuth,
  Router,
  sendCSVStream,
  sendJSON,
  sendJSONStream,
  setSoftCloseHandler,
  typedErrorHandler,
} from 'web-listener';
import { WebSocketServer } from 'ws';
import { WebsocketHandlerFactory } from 'shared-reducer/backend';
import { DuplicateError } from 'collection-storage';
import { ApiRetroArchivesRouter } from './ApiRetroArchivesRouter';
import type { UserAuthService } from '../services/UserAuthService';
import type { RetroAuthService } from '../services/RetroAuthService';
import type { RetroService } from '../services/RetroService';
import type { RetroArchiveService } from '../services/RetroArchiveService';
import type { AnalyticsService } from '../services/AnalyticsService';
import { extractExportedRetro } from '../helpers/exportedJsonParsers';
import { json } from '../helpers/json';
import {
  exportRetroJson,
  importRetroDataJson,
  importTimestamp,
} from '../export/RetroJsonExport';
import { exportRetroTable } from '../export/RetroTableExport';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 512;

export class ApiRetrosRouter extends Router {
  public constructor(
    userAuthService: UserAuthService,
    retroAuthService: RetroAuthService,
    retroService: RetroService,
    retroArchiveService: RetroArchiveService,
    analyticsService: AnalyticsService,
    permitMyRetros: boolean,
  ) {
    super();

    const acceptWebSocket = makeAcceptWebSocket(WebSocketServer);
    const userAuth = requireBearerAuth({
      realm: 'user',
      extractAndValidateToken: (token) =>
        userAuthService.readAndVerifyToken(token),
    });

    const wsHandlerFactory = new WebsocketHandlerFactory(
      retroService.retroBroadcaster,
    );

    this.get('/', userAuth, async (req, res) => {
      const userId = userAuth.getTokenData(req).sub;

      if (!permitMyRetros) {
        return sendJSON(res, { retros: [] });
      }

      analyticsService.event(req, 'access own retros list');
      const retros = retroService.getRetroListForUser(userId);
      try {
        await sendJSONStream(res, { retros });
      } finally {
        retros.return();
      }
    });

    this.post(
      '/',
      userAuth,
      async (req, res) => {
        const userId = userAuth.getTokenData(req).sub;
        const body = await getBodyJson(req, { maxContentBytes: 512 * 1024 });
        const { slug, name, password, importJson } = json.extractObject(body, {
          slug: json.string,
          name: json.string,
          password: json.string,
          importJson: json.optional(extractExportedRetro),
        });

        if (!name) {
          throw new HTTPError(400, { body: 'No name given' });
        }
        if (password.length < MIN_PASSWORD_LENGTH) {
          throw new HTTPError(400, { body: 'Password is too short' });
        }
        if (password.length > MAX_PASSWORD_LENGTH) {
          throw new HTTPError(400, { body: 'Password is too long' });
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

        if (importJson) {
          analyticsService.event(req, 'import retro');
        } else {
          analyticsService.event(req, 'create retro');
        }
        return sendJSON(res, { id, token });
      },
      typedErrorHandler(DuplicateError, () => {
        throw new HTTPError(409, { body: 'URL is already taken' });
      }),
    );

    const retroRouter = this.within('/:retroId');

    retroRouter.use(
      requireBearerAuth({
        realm: (req) => getPathParameter(req, 'retroId'),
        extractAndValidateToken: (token, realm) =>
          retroAuthService.readAndVerifyToken(realm, token),
        fallbackTokenFetcher:
          makeWebSocketFallbackTokenFetcher(acceptWebSocket),
      }),
    );

    retroRouter.ws(
      '/',
      requireAuthScope('read'),
      wsHandlerFactory.handler({
        accessGetter: (req) => ({
          id: getPathParameter(req, 'retroId'),
          permission: retroService.getPermissions(hasAuthScope(req, 'write')),
        }),
        acceptWebSocket,
        setSoftCloseHandler,
        pongTimeout: 60_000,
        onConnect: (req) => {
          analyticsService.event(req, 'retro session begin');
        },
        onDisconnect: (req, closeReason, duration) => {
          analyticsService.event(req, 'retro session', {
            closeReason,
            duration,
          });
        },
        onError: (req, context, err) =>
          analyticsService.requestError(
            req,
            `Retro websocket error: ${context}`,
            err,
          ),
      }),
    );

    retroRouter.get(
      '/export/:format',
      requireAuthScope('read'),
      requireAuthScope('readArchives'),
      async (req, res) => {
        const { retroId, format } = getPathParameters(req);

        const retro = await retroService.getRetro(retroId);
        if (!retro) {
          throw new HTTPError(404, { body: 'Retro not found' });
        }

        analyticsService.event(req, `export ${format}`);

        const archives = retroArchiveService.getRetroArchiveList(retroId);
        try {
          switch (format) {
            case 'json': {
              res.setHeader(
                'content-disposition',
                `attachment; filename="${encodeURIComponent(`${retro.slug}-export.json`)}"`,
              );
              return await sendJSONStream(
                res,
                exportRetroJson(retro, archives),
                { space: 2 },
              );
            }
            case 'csv': {
              res.setHeader(
                'content-disposition',
                `attachment; filename="${encodeURIComponent(`${retro.slug}-export.csv`)}"`,
              );
              return await sendCSVStream(
                res,
                exportRetroTable(retro, archives),
                { headerRow: true },
              );
            }
            default:
              throw new HTTPError(404, { body: 'Unknown format' });
          }
        } finally {
          await archives.return();
        }
      },
    );

    retroRouter.mount(
      '/archives',
      new ApiRetroArchivesRouter(retroArchiveService, analyticsService),
    );
  }
}
