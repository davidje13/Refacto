import { WebSocketExpress, Router } from 'websocket-express';
import { type RetroArchiveService } from '../services/RetroArchiveService';
import { type AnalyticsService } from '../services/AnalyticsService';
import { extractRetroData } from '../helpers/jsonParsers';
import { safe } from '../helpers/routeHelpers';

const JSON_BODY = WebSocketExpress.json({ limit: 512 * 1024 });

export class ApiRetroArchivesRouter extends Router {
  public constructor(
    retroArchiveService: RetroArchiveService,
    analyticsService: AnalyticsService,
  ) {
    super({ mergeParams: true });

    this.get(
      '/',
      WebSocketExpress.requireAuthScope('readArchives'),
      safe<{ retroId: string }>(async (req, res) => {
        const { retroId } = req.params;

        const archives =
          await retroArchiveService.getRetroArchiveSummaries(retroId);

        analyticsService.event(req, 'access archive list');
        res.json({ archives });
      }),
    );

    this.post(
      '/',
      WebSocketExpress.requireAuthScope('write'),
      JSON_BODY,
      safe<{ retroId: string }>(async (req, res) => {
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

          analyticsService.event(req, 'create archive');
          res.status(200).json({ id });
        } catch (err) {
          if (!(err instanceof Error)) {
            analyticsService.error('Error creating retro archive', err);
            res.status(500).json({ error: 'Internal error' });
          } else {
            res.status(400).json({ error: err.message });
          }
        }
      }),
    );

    this.get(
      '/:archiveId',
      WebSocketExpress.requireAuthScope('readArchives'),
      safe<{ retroId: string; archiveId: string }>(async (req, res) => {
        const { retroId, archiveId } = req.params;

        const archive = await retroArchiveService.getRetroArchive(
          retroId,
          archiveId,
        );

        if (!archive) {
          res.status(404).end();
          return;
        }

        analyticsService.event(req, 'access archive');
        res.json(archive);
      }),
    );
  }
}
