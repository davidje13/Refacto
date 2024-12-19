import { Router } from 'websocket-express';
import { type RetroService } from '../services/RetroService';
import { safe } from '../helpers/routeHelpers';

export class ApiSlugsRouter extends Router {
  public constructor(retroService: RetroService) {
    super();

    this.get(
      '/:slug',
      safe<{ slug: string }>(async (req, res) => {
        const { slug } = req.params;
        const retroId = await retroService.getRetroIdForSlug(slug);

        if (retroId !== null) {
          res.json({ id: retroId });
        } else {
          res.status(404).end();
        }
      }),
    );
  }
}
