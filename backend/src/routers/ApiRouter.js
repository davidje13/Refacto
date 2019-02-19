import express from 'express';

export default class ApiRouter extends express.Router {
  constructor(retroService) {
    super();

    this.get('/retros', async (req, res) => {
      res.json({
        retros: await retroService.getRetros(),
      });
    });

    this.get('/retros/:slug', async (req, res) => {
      const retro = await retroService.getRetro(req.params.slug);

      if (retro) {
        res.json(retro);
      } else {
        res.status(404).end();
      }
    });
  }
}
