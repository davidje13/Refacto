import WebSocketExpress from 'websocket-express';
import type { RetroService } from '../services/RetroService';

export class ApiSlugsRouter extends WebSocketExpress.Router {
  public constructor(retroService: RetroService) {
    super();

    this.get('/:slug', async (req, res) => {
      const { slug } = req.params;
      const retroId = await retroService.getRetroIdForSlug(slug);

      if (retroId !== null) {
        res.json({ id: retroId });
      } else {
        res.status(404).end();
      }
    });
  }
}
