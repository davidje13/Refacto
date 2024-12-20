import { Router } from 'websocket-express';
import { type GiphyService } from '../services/GiphyService';
import { logError } from '../log';
import { safe } from '../helpers/routeHelpers';

export class ApiGiphyRouter extends Router {
  public constructor(service: GiphyService) {
    super();

    this.get(
      '/search',
      safe(async (req, res) => {
        const { q, lang } = req.query;

        if (typeof q !== 'string' || !q) {
          res.status(400).json({ error: 'Bad request' });
          return;
        }

        if (typeof lang !== 'string' && lang !== undefined) {
          res.status(400).json({ error: 'Bad request' });
          return;
        }

        try {
          const gifs = await service.search(q, 0, 50, lang);

          res.json({ gifs });
        } catch (err) {
          logError('Giphy proxy error', err);
          res.status(500).json({ error: 'Proxy error' });
        }
      }),
    );
  }
}
