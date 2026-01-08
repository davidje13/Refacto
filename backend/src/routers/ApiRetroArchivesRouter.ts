import {
  getBodyJson,
  getPathParameters,
  HTTPError,
  requireAuthScope,
  Router,
  sendJSON,
  sendJSONStream,
  type WithPathParameters,
} from 'web-listener';
import type { RetroArchiveService } from '../services/RetroArchiveService';
import type { AnalyticsService } from '../services/AnalyticsService';
import { extractRetroData } from '../helpers/jsonParsers';

export class ApiRetroArchivesRouter extends Router<
  WithPathParameters<{ retroId: string }>
> {
  public constructor(
    retroArchiveService: RetroArchiveService,
    analyticsService: AnalyticsService,
  ) {
    super();

    this.get('/', requireAuthScope('readArchives'), async (req, res) => {
      const { retroId } = getPathParameters(req);

      analyticsService.event(req, 'access archive list');

      const archives = retroArchiveService.getRetroArchiveSummaries(retroId);
      try {
        await sendJSONStream(res, { archives });
      } finally {
        archives.return();
      }
    });

    this.post('/', requireAuthScope('write'), async (req, res) => {
      const { retroId } = getPathParameters(req);
      const data = extractRetroData(
        await getBodyJson(req, { maxContentBytes: 512 * 1024 }),
      );
      if (!data.format) {
        throw new HTTPError(400, { body: 'No format given' });
      }
      if (!data.items.length) {
        throw new HTTPError(400, { body: 'No items given' });
      }
      const id = await retroArchiveService.createArchive(retroId, data);

      analyticsService.event(req, 'create archive');
      return sendJSON(res, { id });
    });

    this.get(
      '/:archiveId',
      requireAuthScope('readArchives'),
      async (req, res) => {
        const { retroId, archiveId } = getPathParameters(req);

        const archive = await retroArchiveService.getRetroArchive(
          retroId,
          archiveId,
        );

        if (!archive) {
          throw new HTTPError(404, { body: 'Archive not found' });
        }

        analyticsService.event(req, 'access archive');
        return sendJSON(res, archive);
      },
    );
  }
}
