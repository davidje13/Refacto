import { WebSocketExpress, Router } from 'websocket-express';
import type { RetroArchiveService } from '../services/RetroArchiveService';
import type { AnalyticsService } from '../services/AnalyticsService';
import type { Logger } from '../services/LogService';
import { extractRetroData } from '../helpers/jsonParsers';

const JSON_BODY = WebSocketExpress.json({ limit: 512 * 1024 });

export class ApiRetroArchivesRouter extends Router {
  public constructor(
    retroArchiveService: RetroArchiveService,
    logger: Logger,
    analyticsService: AnalyticsService,
  ) {
    super({ mergeParams: true });

    this.get<{ retroId: string }>(
      '/',
      WebSocketExpress.requireAuthScope('readArchives'),
      async (req, res) => {
        const { retroId } = req.params;

        const archives =
          await retroArchiveService.getRetroArchiveSummaries(retroId);

        analyticsService.event(req, 'access archive list');
        res.json({ archives });
      },
    );

    this.post<{ retroId: string }>(
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

          analyticsService.event(req, 'create archive');
          res.status(200).json({ id });
        } catch (err) {
          if (!(err instanceof Error)) {
            logger.error('Error creating retro archive', err);
            res.status(500).json({ error: 'Internal error' });
          } else {
            res.status(400).json({ error: err.message });
          }
        }
      },
    );

    this.get<{ retroId: string; archiveId: string }>(
      '/:archiveId',
      WebSocketExpress.requireAuthScope('readArchives'),
      async (req, res) => {
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
      },
    );
  }
}
