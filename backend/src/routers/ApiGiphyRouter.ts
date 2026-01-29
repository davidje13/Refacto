import { getQuery, HTTPError, Router, sendJSON } from 'web-listener';
import type { GiphyService } from '../services/GiphyService';
import type { AnalyticsService } from '../services/AnalyticsService';

export class ApiGiphyRouter extends Router {
  constructor(service: GiphyService, analyticsService: AnalyticsService) {
    super();

    this.get('/search', async (req, res) => {
      const q = getQuery(req, 'q');
      const lang = getQuery(req, 'lang');

      if (!q) {
        throw new HTTPError(400, { body: 'Bad request' });
      }

      try {
        const gifs = await service.search(q, 0, 50, lang ?? undefined);

        analyticsService.event(req, 'search giphy');
        return sendJSON(res, { gifs });
      } catch (err) {
        throw new HTTPError(500, { body: 'Giphy proxy error', cause: err });
      }
    });
  }
}
