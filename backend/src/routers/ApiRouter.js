import { Router } from 'websocket-express';
import crypto from 'crypto';

class UniqueIdProvider {
  constructor() {
    this.shared = crypto.randomBytes(8).toString('hex');
    this.unique = 0;
  }

  get() {
    const id = this.unique;
    this.unique += 1;
    return `${this.shared}-${id}`;
  }
}

export default class ApiRouter extends Router {
  constructor(retroService) {
    super();

    const idProvider = new UniqueIdProvider();

    this.get('/slugs/:slug', async (req, res) => {
      const { slug } = req.params;
      const retroid = await retroService.getRetroIdForSlug(slug);

      if (retroid !== null) {
        res.json({ id: retroid });
      } else {
        res.status(404).end();
      }
    });

    this.get('/retros', async (req, res) => {
      res.json({
        retros: await retroService.getRetroList(),
      });
    });

    this.get('/retros/:retroid', async (req, res) => {
      const { retroid } = req.params;
      const retro = await retroService.getRetro(retroid);

      if (retro) {
        res.json(retro);
      } else {
        res.status(404).end();
      }
    });

    this.ws('/retros/:retroid', async (req, ws) => {
      const { retroid } = req.params;

      const mySourceId = idProvider.get();

      const onChange = (change, { id, sourceId }) => {
        const message = { change };
        if (sourceId === mySourceId) {
          message.id = id;
        }
        ws.send(JSON.stringify(message));
      };

      const subscription = await retroService.subscribeRetro(retroid, onChange);

      if (!subscription) {
        ws.close();
        return;
      }

      ws.on('close', subscription.close);

      ws.on('message', (msg) => {
        const { change, id } = JSON.parse(msg);
        subscription.send(change, { sourceId: mySourceId, id });
      });

      ws.send(JSON.stringify({
        change: { $set: subscription.getInitialData() },
      }));
    });

    this.get('/retros/:retroid/archives/:archiveid', async (req, res) => {
      const { retroid, archiveid } = req.params;
      const archive = await retroService.getRetroArchive(retroid, archiveid);

      if (archive) {
        res.json(archive);
      } else {
        res.status(404).end();
      }
    });
  }
}
