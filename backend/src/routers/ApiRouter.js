import { Router } from 'websocket-express';
import UniqueIdProvider from '../helpers/UniqueIdProvider';

const VALID_SLUG = /^[a-z0-9][a-z0-9_-]*$/;
const MIN_PASSWORD_LENGTH = 8;

function splitFirst(data, delimiter) {
  const sep = data.indexOf(delimiter);
  if (sep === -1) {
    return [data];
  }
  return [data.substr(0, sep), data.substr(sep + delimiter.length)];
}

function extractToken(auth) {
  const [type, data] = splitFirst(auth, ' ');

  if (type === 'Bearer') {
    return data;
  }

  return null;
}

function nextMessage(ws) {
  return new Promise((resolve, reject) => {
    let onMessage = null;
    let onClose = null;

    const detach = () => {
      ws.off('message', onMessage);
      ws.off('close', onClose);
    };

    onMessage = (msg) => {
      detach();
      resolve(msg);
    };

    onClose = () => {
      detach();
      reject();
    };

    ws.on('message', onMessage);
    ws.on('close', onClose);
  });
}

export default class ApiRouter extends Router {
  constructor(userAuthService, retroAuthService, retroService) {
    super();

    const idProvider = new UniqueIdProvider();

    const getUserAuthentication = async (req) => {
      const auth = req.get('Authorization');
      if (!auth) {
        return null;
      }

      const userToken = extractToken(auth);
      if (!userToken) {
        return null;
      }

      return userAuthService.readAndVerifyToken(userToken);
    };

    const getRetroAuthentication = async (req, retroId) => {
      const auth = req.get('Authorization');
      if (!auth) {
        return null;
      }

      const retroToken = extractToken(auth);
      if (!retroToken) {
        return null;
      }

      return retroAuthService.readAndVerifyToken(retroId, retroToken);
    };

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

    this.get('/retros', async (req, res) => {
      const auth = await getUserAuthentication(req);
      if (!auth) {
        res
          .status(401)
          .header('WWW-Authenticate', 'Bearer realm="user"')
          .end();
        return;
      }

      res.json({
        retros: await retroService.getRetroListForUser(auth.id),
      });
    });

    this.post('/retros', async (req, res) => {
      const auth = await getUserAuthentication(req);
      if (!auth) {
        res
          .status(401)
          .header('WWW-Authenticate', 'Bearer realm="user"')
          .end();
        return;
      }

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

    this.ws('/retros/:retroId', async (req, ws) => {
      const { retroId } = req.params;
      let auth = await getRetroAuthentication(req, retroId);
      if (!auth) {
        const retroToken = await nextMessage(ws);
        auth = await retroAuthService.readAndVerifyToken(retroId, retroToken);
        if (!auth) {
          ws.close(4401, 'Unauthorized');
          return;
        }
      }
      if (!auth.read) {
        ws.close(4403, 'Forbidden');
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
        ws.close(4404, 'Not Found');
        return;
      }

      ws.on('close', subscription.close);

      ws.on('message', (msg) => {
        const { change, id } = JSON.parse(msg);
        if (!auth.write) {
          ws.close(4403, 'Forbidden');
          return;
        }
        subscription.send(change, { sourceId: mySourceId, id });
      });

      ws.send(JSON.stringify({
        change: { $set: subscription.getInitialData() },
      }));
    });

    this.post('/retros/:retroId/archives', async (req, res) => {
      const { retroId } = req.params;
      const auth = await getRetroAuthentication(req, retroId);
      if (!auth) {
        res
          .status(401)
          .header('WWW-Authenticate', `Bearer realm="${retroId}", scope="write"`)
          .end();
        return;
      }
      if (!auth.write) {
        res.status(403).end();
        return;
      }

      const id = await retroService.createArchive(retroId);

      res.status(200).json({ id });
    });

    this.get('/retros/:retroId/archives/:archiveId', async (req, res) => {
      const { retroId, archiveId } = req.params;
      const auth = await getRetroAuthentication(req, retroId);
      if (!auth) {
        res
          .status(401)
          .header('WWW-Authenticate', `Bearer realm="${retroId}", scope="readArchives"`)
          .end();
        return;
      }
      if (!auth.readArchives) {
        res.status(403).end();
        return;
      }

      const archive = await retroService.getRetroArchive(retroId, archiveId);

      if (archive) {
        res.json(archive);
      } else {
        res.status(404).end();
      }
    });
  }
}
