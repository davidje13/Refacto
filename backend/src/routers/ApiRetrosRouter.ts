import type { IncomingMessage } from 'node:http';
import {
  addTeardown,
  getAuthScopes,
  getBodyJSON,
  getPathParameter,
  getPathParameters,
  getQuery,
  HTTPError,
  makeAcceptWebSocket,
  makeWebSocketFallbackTokenFetcher,
  requireAuthScope,
  requireBearerAuth,
  Router,
  scheduleClose,
  sendCSVStream,
  sendJSON,
  sendJSONStream,
  setSoftCloseHandler,
  typedErrorHandler,
} from 'web-listener';
import { WebSocketServer } from 'ws';
import { WebsocketHandlerFactory } from 'shared-reducer/backend';
import { DuplicateError } from 'collection-storage';
import type {
  PasswordRequirements,
  RetroCreationInfo,
} from '../shared/api-entities';
import { ApiRetroArchivesRouter } from './ApiRetroArchivesRouter';
import { ApiRetroApiKeysRouter } from './ApiRetroApiKeysRouter';
import type { UserAuthService } from '../services/UserAuthService';
import type { RetroAuthService } from '../services/RetroAuthService';
import type { RetroService } from '../services/RetroService';
import type { RetroArchiveService } from '../services/RetroArchiveService';
import type { RetroDeletionService } from '../services/RetroDeletionService';
import type { AnalyticsService } from '../services/AnalyticsService';
import { extractExportedRetro } from '../helpers/exportedJsonParsers';
import { MultiMap } from '../helpers/MultiMap';
import { json } from '../helpers/json';
import {
  exportRetroJson,
  importRetroDataJson,
  importTimestamp,
} from '../export/RetroJsonExport';
import { exportRetroTable } from '../export/RetroTableExport';

export class ApiRetrosRouter extends Router {
  private readonly _activeConnections = new MultiMap<string, IncomingMessage>();

  constructor(
    userAuthService: UserAuthService,
    retroAuthService: RetroAuthService,
    retroService: RetroService,
    retroArchiveService: RetroArchiveService,
    retroDeletionService: RetroDeletionService,
    analyticsService: AnalyticsService,
    permitMyRetros: boolean,
    passwordRequirements: PasswordRequirements,
    deleteRetroDelay: number,
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
        const body = await getBodyJSON(req, { maxContentBytes: 512 * 1024 });
        const { slug, name, password, importJson } = json.extractObject(body, {
          slug: json.string,
          name: json.string,
          password: json.string,
          importJson: json.optional(extractExportedRetro),
        });

        if (!name) {
          throw new HTTPError(400, { body: 'No name given' });
        }
        if (password.length < passwordRequirements.minLength) {
          throw new HTTPError(400, { body: 'Password is too short' });
        }
        if (password.length > passwordRequirements.maxLength) {
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

        const grant = await retroAuthService.grantOwnerToken(id);
        if (!grant) {
          throw new Error(
            `retro ${id} auth deleted immediately after creation`,
          );
        }

        if (importJson) {
          analyticsService.event(req, 'import retro');
        } else {
          analyticsService.event(req, 'create retro');
        }
        const response: RetroCreationInfo = {
          id,
          token: grant.token,
          scopes: [...grant.scopes],
          expires: grant.expires,
        };
        return sendJSON(res, response);
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
          permission: retroService.getPermissions(getAuthScopes(req)),
          eventFilter: retroService.getEventFilter(getAuthScopes(req)),
        }),
        acceptWebSocket,
        setSoftCloseHandler,
        pongTimeout: 60_000,
        onConnect: (req) => {
          const { retroId } = getPathParameters(req);
          this._activeConnections.add(retroId, req);
          addTeardown(req, () => this._activeConnections.remove(retroId, req));
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

    retroRouter.get('/', requireAuthScope('read'), async (req, res) => {
      const { retroId } = getPathParameters(req);
      const data = await retroService.getRetro(retroId);
      if (!data) {
        throw new HTTPError(404);
      }
      const itemsCondition = getQuery(req, 'items');
      if (itemsCondition) {
        let predicate: (o: unknown) => boolean;
        try {
          predicate = retroService.mutationContext.makeConditionPredicate(
            JSON.parse(itemsCondition),
          );
        } catch (err) {
          throw new HTTPError(400, { body: 'invalid item filter', cause: err });
        }
        analyticsService.event(req, 'get filtered retro snapshot');
        sendJSON(res, {
          ...data,
          items: data.items.filter(predicate),
        });
      } else {
        analyticsService.event(req, 'get retro snapshot');
        sendJSON(res, data);
      }
    });

    retroRouter.patch('/', async (req, res) => {
      const { retroId } = getPathParameters(req);
      const body = await getBodyJSON(req, { maxContentBytes: 64 * 1024 });
      const { change, setPassword, cancelDelete } = json.extractObject(body, {
        change: json.optional(json.any),
        setPassword: json.optional(
          json.object({
            password: json.string,
            evictUsers: json.boolean,
          }),
        ),
        cancelDelete: json.optional(json.boolean),
      });

      // early validation (to avoid partial updates)

      if (setPassword || cancelDelete) {
        await requireAuthScope('manage').handleRequest(req, res);
      }

      if (setPassword) {
        if (setPassword.password.length < passwordRequirements.minLength) {
          throw new HTTPError(400, { body: 'Password is too short' });
        }
        if (setPassword.password.length > passwordRequirements.maxLength) {
          throw new HTTPError(400, { body: 'Password is too long' });
        }
      }

      // apply

      if (change) {
        await requireAuthScope('write').handleRequest(req, res);
        const permission = retroService.getPermissions(getAuthScopes(req));
        await retroService.retroBroadcaster.update(retroId, change, {
          permission,
        });
        analyticsService.event(req, 'patch retro content');
      }

      if (setPassword) {
        await retroAuthService.setPassword(retroId, setPassword.password, {
          cycleKeys: setPassword.evictUsers,
        });
        let evicted = 0;
        if (setPassword.evictUsers) {
          evicted = this.evictUsers(retroId, 'password changed');
        }
        analyticsService.event(req, 'change retro password', {
          evictUsers: setPassword.evictUsers,
          evicted,
        });
      }

      if (cancelDelete) {
        await retroDeletionService.cancelDeletion(retroId);
        analyticsService.event(req, 'cancel retro delete');
      }

      return sendJSON(res, {});
    });

    retroRouter.delete('/', requireAuthScope('manage'), async (req, res) => {
      const { retroId } = getPathParameters(req);

      if (deleteRetroDelay < 0) {
        throw new HTTPError(403, {
          body: 'Retro deletion is not permitted',
        });
      }

      if (deleteRetroDelay > 0) {
        const schedule = Date.now() + deleteRetroDelay;
        await retroDeletionService.scheduleDeletion(retroId, schedule);
        analyticsService.event(req, 'delete retro scheduled', { retroId });
        res.statusCode = 202;
        return sendJSON(res, { scheduledTime: schedule });
      } else {
        await retroDeletionService.scheduleDeletion(retroId, 0);
        analyticsService.event(req, 'delete retro immediate', { retroId });
        return sendJSON(res, {});
      }
    });

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
      '/api-keys',
      new ApiRetroApiKeysRouter(retroAuthService, analyticsService),
    );

    retroRouter.mount(
      '/archives',
      new ApiRetroArchivesRouter(retroArchiveService, analyticsService),
    );
  }

  evictUsers(retroId: string, reason: string) {
    const connections = this._activeConnections.listAndPurge(retroId);
    const evicted = connections.size;
    const time = Date.now();
    for (const connection of connections) {
      scheduleClose(
        connection,
        reason,
        time + DISCONNECT_GRACE,
        DISCONNECT_GRACE,
      );
    }
    return evicted;
  }
}

const DISCONNECT_GRACE = 3000;
