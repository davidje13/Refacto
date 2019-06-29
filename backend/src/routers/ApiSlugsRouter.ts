import { Router } from 'websocket-express';
import RetroService from '../services/RetroService';

export default class ApiSlugsRouter extends Router {
  public constructor(retroService: RetroService) {
    super();

    this.get('/:slug', async (req, res): Promise<void> => {
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
