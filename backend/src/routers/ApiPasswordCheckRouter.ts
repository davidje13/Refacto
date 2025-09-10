import { Router } from 'websocket-express';
import type { PasswordCheckService } from '../services/PasswordCheckService';
import type { Logger } from '../services/LogService';
import { safe } from '../helpers/routeHelpers';

const VALID_RANGE = /^[0-9A-Z]{5}$/;

const CACHE_CONTROL = [
  'public',
  `max-age=${30 * 24 * 60 * 60}`,
  `stale-if-error=${60 * 24 * 60 * 60}`,
  'immutable',
].join(', ');

export class ApiPasswordCheckRouter extends Router {
  public constructor(service: PasswordCheckService, logger: Logger) {
    super();

    this.get(
      '/:range',
      safe<{ range: string }>(async (req, res) => {
        const { range } = req.params;

        if (!VALID_RANGE.test(range)) {
          res.status(400).end();
        }

        try {
          const data = await service.getBreachesRange(range);
          res.header('cache-control', CACHE_CONTROL);
          res.removeHeader('expires');
          res.removeHeader('pragma');
          res.end(data);
        } catch (err) {
          if (err instanceof Error && err.message === 'Invalid range prefix') {
            res.status(400).end();
          } else if (
            err instanceof Error &&
            err.message === 'Service unavailable'
          ) {
            res.status(503).end();
          } else {
            logger.error('Password breaches lookup error', err);
            res.status(500).end();
          }
        }
      }),
    );
  }
}
