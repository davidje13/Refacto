import express from 'express';

export default class ApiRouter extends express.Router {
  constructor(retroService) {
    super();

    this.get('/slugs/:slug', async (req, res) => {
      const { slug } = req.params;
      const retroid = await retroService.getRetroIdForSlug(slug);

      if (retroid !== null) {
        res.json({ id: retroid });
      } else {
        res.status(404).end();
      }
    });

    this.get('/retros', async (req, res) => {
      res.json({
        retros: await retroService.getRetroList(),
      });
    });

    this.get('/retros/:retroid', async (req, res) => {
      const { retroid } = req.params;
      const retro = await retroService.getRetro(retroid);

      if (retro) {
        res.json(retro);
      } else {
        res.status(404).end();
      }
    });

    this.get('/retros/:retroid/archives/:archiveid', async (req, res) => {
      const { retroid, archiveid } = req.params;
      const archive = await retroService.getRetroArchive(retroid, archiveid);

      if (archive) {
        res.json(archive);
      } else {
        res.status(404).end();
      }
    });
  }
}
