import { getPathParameters, Router, sendJSON } from 'web-listener';
import type { RetroService } from '../services/RetroService';

export class ApiSlugsRouter extends Router {
  constructor(retroService: RetroService) {
    super();

    this.get('/:slug', async (req, res) => {
      const { slug } = getPathParameters(req);
      const retroId = await retroService.getRetroIdForSlug(slug);

      if (retroId === null) {
        res.writeHead(404).end();
      } else {
        sendJSON(res, { id: retroId });
      }
    });
  }
}
