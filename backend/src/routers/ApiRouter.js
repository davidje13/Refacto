import Router from '../websocket-express/Router';

export default class ApiRouter extends Router {
  constructor(retroService) {
    super();

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

    this.socketListeners = new Map();

    this.ws('/retros/:retroid', async (req, ws) => {
      const { retroid } = req.params;

      const retro = await retroService.getRetro(retroid);
      if (!retro) {
        ws.close();
        return;
      }

      let listeners = this.socketListeners.get(retroid);
      if (!listeners) {
        listeners = [];
        this.socketListeners.set(retroid, listeners);
      }
      listeners.push(ws);

      ws.on('close', () => {
        listeners.splice(listeners.indexOf(ws), 1);
        if (!listeners.length) {
          this.socketListeners.delete(retroid);
        }
      });

      ws.on('message', (msg) => {
        const { change, id } = JSON.parse(msg);
        // reflect confirmation
        ws.send(JSON.stringify({ change, id }));

        // notify others (TODO: multi-server support)
        const msgOut = JSON.stringify({ change });
        listeners.forEach((listener) => {
          if (listener !== ws) {
            listener.send(msgOut);
          }
        });

        // TODO: store changes
      });

      ws.send(JSON.stringify({ change: { $set: retro } }));
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
