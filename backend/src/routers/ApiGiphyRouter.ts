import { Router } from 'websocket-express';
import type { GiphyService } from '../services/GiphyService';
import type { Logger } from '../services/LogService';
import type { AnalyticsService } from '../services/AnalyticsService';

export class ApiGiphyRouter extends Router {
  public constructor(
    service: GiphyService,
    logger: Logger,
    analyticsService: AnalyticsService,
  ) {
    super();

    this.get('/search', async (req, res) => {
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

        analyticsService.event(req, 'search giphy');
        res.json({ gifs });
      } catch (err) {
        logger.error('Giphy proxy error', err);
        res.status(500).json({ error: 'Proxy error' });
      }
    });
  }
}
