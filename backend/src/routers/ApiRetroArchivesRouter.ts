import { Router, requireAuthScope } from 'websocket-express';
import RetroArchiveService from '../services/RetroArchiveService';

export default class ApiRetroArchivesRouter extends Router {
  public constructor(retroArchiveService: RetroArchiveService) {
    super({ mergeParams: true });

    this.get('/', requireAuthScope('readArchives'), async (req, res) => {
      const { retroId } = req.params;

      const archives = await retroArchiveService.getRetroArchiveList(retroId);
      res.json({ archives });
    });

    this.post('/', requireAuthScope('write'), async (req, res) => {
      const { retroId } = req.params;

      const { format, items } = req.body;
      if (!format || typeof format !== 'string') {
        res.status(400).json({ error: 'No format given' });
        return;
      }
      if (!items || !Array.isArray(items) || !items.length) {
        res.status(400).json({ error: 'No items given' });
        return;
      }
      const id = await retroArchiveService.createArchive(retroId, {
        format,
        items,
      });

      res.status(200).json({ id });
    });

    this.get('/:archiveId', requireAuthScope('readArchives'), async (req, res) => {
      const { retroId, archiveId } = req.params;

      const archive = await retroArchiveService
        .getRetroArchive(retroId, archiveId);

      if (archive) {
        res.json(archive);
      } else {
        res.status(404).end();
      }
    });
  }
}
