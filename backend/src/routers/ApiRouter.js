import { Router } from 'websocket-express';
import { userAuth, retroAuth, authScope } from './authMiddleware';
import UniqueIdProvider from '../helpers/UniqueIdProvider';

const VALID_SLUG = /^[a-z0-9][a-z0-9_-]*$/;
const MIN_PASSWORD_LENGTH = 8;

export default class ApiRouter extends Router {
  constructor(
    userAuthService,
    retroAuthService,
    retroService,
    retroArchiveService,
  ) {
    super();

    const idProvider = new UniqueIdProvider();
    const userAuthMiddleware = userAuth(userAuthService);
    const retroAuthMiddleware = retroAuth(retroAuthService);

    this.get('/slugs/:slug', async (req, res) => {
      const { slug } = req.params;
      const retroId = await retroService.getRetroIdForSlug(slug);

      if (retroId !== null) {
        res.json({ id: retroId });
      } else {
        res.status(404).end();
      }
    });

    this.post('/auth/tokens/:retroId', async (req, res) => {
      const { retroId } = req.params;
      const { password } = req.body;

      const permissions = {
        read: true,
        readArchives: true,
        write: true,
      };
      const retroToken = await retroAuthService.exchangePassword(
        retroId,
        password,
        permissions,
      );
      if (!retroToken) {
        res.status(400).json({ error: 'incorrect password' });
        return;
      }

      res.status(200).json({ retroToken });
    });

    this.get('/retros', userAuthMiddleware, async (req, res) => {
      res.json({
        retros: await retroService.getRetroListForUser(res.locals.auth.id),
      });
    });

    this.post('/retros', userAuthMiddleware, async (req, res) => {
      const { auth } = res.locals;
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
        const id = await retroService.createRetro(auth.id, slug, name, 'mood');
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

    this.useHTTP('/retros/:retroId', retroAuthMiddleware);

    this.ws(
      '/retros/:retroId',
      retroAuth(retroAuthService, { optional: true }),
      async (req, res) => {
        const { retroId } = req.params;
        const ws = await res.accept();

        let { auth } = res.locals;
        if (!auth) {
          const retroToken = await ws.nextMessage({ timeout: 5000 });
          auth = await retroAuthService.readAndVerifyToken(retroId, retroToken);
        }
        if (!auth) {
          res.sendError(401);
          return;
        }
        if (!auth.read) {
          res.sendError(403);
          return;
        }

        const mySourceId = idProvider.get();

        const onChange = ({ change, meta: { id, sourceId } }) => {
          const message = { change };
          if (sourceId === mySourceId) {
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
          if (!auth.write) {
            res.sendError(403);
            return;
          }
          subscription.send(change, { sourceId: mySourceId, id });
        });

        ws.send(JSON.stringify({
          change: { $set: subscription.getInitialData() },
        }));
      },
    );

    this.get(
      '/retros/:retroId/archives',
      authScope('readArchives'),
      async (req, res) => {
        const { retroId } = req.params;

        const archives = await retroArchiveService.getRetroArchiveList(retroId);
        res.json(archives);
      },
    );

    this.post(
      '/retros/:retroId/archives',
      authScope('write'),
      async (req, res) => {
        const { retroId } = req.params;

        const { format, items } = req.body;
        const id = await retroArchiveService.createArchive(retroId, {
          format,
          items,
        });

        res.status(200).json({ id });
      },
    );

    this.get(
      '/retros/:retroId/archives/:archiveId',
      authScope('readArchives'),
      async (req, res) => {
        const { retroId, archiveId } = req.params;

        const archive = await retroArchiveService
          .getRetroArchive(retroId, archiveId);

        if (archive) {
          res.json(archive);
        } else {
          res.status(404).end();
        }
      },
    );
  }
}
