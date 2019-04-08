import { Router } from 'websocket-express';
import UniqueIdProvider from '../helpers/UniqueIdProvider';

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
  constructor(authService, retroService) {
    super();

    const idProvider = new UniqueIdProvider();

    const getAuthentication = async (req, retroId) => {
      const auth = req.get('Authorization');
      if (!auth) {
        return null;
      }

      const token = extractToken(auth);
      if (!token) {
        return null;
      }

      return authService.readAndVerifyToken(retroId, token);
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
      const token = await authService.exchangePassword(retroId, password, permissions);
      if (!token) {
        res.status(400).json({ error: 'incorrect password' });
        return;
      }

      res.status(200).json({ token });
    });

    this.get('/retros', async (req, res) => {
      res.json({
        retros: await retroService.getRetroList(),
      });
    });

    this.get('/retros/:retroId', async (req, res) => {
      const { retroId } = req.params;
      const auth = await getAuthentication(req, retroId);
      if (!auth) {
        res
          .status(401)
          .header('WWW-Authenticate', `Bearer realm="${retroId}", scope="read"`)
          .end();
        return;
      }
      if (!auth.readArchives) {
        res.status(403).end();
        return;
      }

      const retro = await retroService.getRetro(retroId);

      if (retro) {
        res.json(retro);
      } else {
        res.status(404).end();
      }
    });

    this.ws('/retros/:retroId', async (req, ws) => {
      const { retroId } = req.params;
      let auth = await getAuthentication(req, retroId);
      if (!auth) {
        const token = await nextMessage(ws);
        auth = await authService.readAndVerifyToken(retroId, token);
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

      const onChange = (change, { id, sourceId }) => {
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

    this.get('/retros/:retroId/archives/:archiveid', async (req, res) => {
      const { retroId, archiveid } = req.params;
      const auth = await getAuthentication(req, retroId);
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

      const archive = await retroService.getRetroArchive(retroId, archiveid);

      if (archive) {
        res.json(archive);
      } else {
        res.status(404).end();
      }
    });
  }
}
