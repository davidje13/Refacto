import WebSocketExpress from 'websocket-express';
import type { RetroArchiveService } from '../services/RetroArchiveService';
import { extractRetroData } from '../helpers/jsonParsers';

const JSON_BODY = WebSocketExpress.default.json({ limit: 512 * 1024 });

export class ApiRetroArchivesRouter extends WebSocketExpress.Router {
  public constructor(retroArchiveService: RetroArchiveService) {
    super({ mergeParams: true });

    this.get(
      '/',
      WebSocketExpress.requireAuthScope('readArchives'),
      async (req, res) => {
        const { retroId } = req.params;

        const archives = await retroArchiveService.getRetroArchiveSummaries(
          retroId,
        );
        res.json({ archives });
      },
    );

    this.post(
      '/',
      WebSocketExpress.requireAuthScope('write'),
      JSON_BODY,
      async (req, res) => {
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
          if (!(e instanceof Error)) {
            process.stderr.write(`Unexpected error: ${e}\n`);
            res.status(400).json({ error: 'Internal error' });
          } else {
            res.status(400).json({ error: e.message });
          }
        }
      },
    );

    this.get(
      '/:archiveId',
      WebSocketExpress.requireAuthScope('readArchives'),
      async (req, res) => {
        const { retroId, archiveId } = req.params;

        const archive = await retroArchiveService.getRetroArchive(
          retroId,
          archiveId,
        );

        if (archive) {
          res.json(archive);
        } else {
          res.status(404).end();
        }
      },
    );
  }
}
