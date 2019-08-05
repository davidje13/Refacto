import { Router, requireAuthScope } from 'websocket-express';
import RetroArchiveService from '../services/RetroArchiveService';
import { extractRetroData } from '../helpers/jsonParsers';

export default class ApiRetroArchivesRouter extends Router {
  public constructor(retroArchiveService: RetroArchiveService) {
    super({ mergeParams: true });

    this.get('/', requireAuthScope('readArchives'), async (req, res) => {
      const { retroId } = req.params;

      const archives = await retroArchiveService.getRetroArchiveList(retroId);
      res.json({ archives });
    });

    this.post('/', requireAuthScope('write'), async (req, res) => {
      try {
        const { retroId } = req.params;
        const data = extractRetroData(req.body);
        if (!data.format) {
          throw new Error('No format given');
        }
        if (!data.items.length) {
          throw new Error('No items given');
        }
        const id = await retroArchiveService.createArchive(retroId, data);

        res.status(200).json({ id });
      } catch (e) {
        res.status(400).json({ error: e.message });
      }
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
