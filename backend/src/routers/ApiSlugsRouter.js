import { Router } from 'websocket-express';

export default class ApiSlugsRouter extends Router {
  constructor(retroService) {
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
