import { Router } from 'websocket-express';
import type { GiphyService } from '../services/GiphyService';
import { logError } from '../log';

export class ApiGiphyRouter extends Router {
  public constructor(service: GiphyService) {
    super();

    this.get('/search', async (req, res) => {
      const { q, lang = 'en' } = req.query;

      if (typeof q !== 'string' || !q) {
        res.status(400).json({ error: 'Bad request' });
        return;
      }

      if (typeof lang !== 'string') {
        res.status(400).json({ error: 'Bad request' });
        return;
      }

      try {
        const gifs = await service.search(q, 10, lang);

        res.json({ gifs });
      } catch (err) {
        logError('Giphy proxy error', err);
        res.status(500).json({ error: 'Proxy error' });
      }
    });
  }
}
