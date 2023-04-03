import { Router } from 'websocket-express';
import type { GiphyService } from '../services/GiphyService';

export class ApiGiphyRouter extends Router {
  public constructor(service: GiphyService) {
    super();

    this.get('/search', async (req, res) => {
      const { q, lang = 'en' } = req.query;

      if (typeof q !== 'string' || !q) {
        res.status(400).end();
        return;
      }

      if (typeof lang !== 'string') {
        res.status(400).end();
        return;
      }

      try {
        const gifs = await service.search(q, 10, lang);

        res.json({ gifs });
      } catch (err) {
        res.status(500).end();
      }
    });
  }
}
