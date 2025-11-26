import {
  conditionalErrorHandler,
  getPathParameters,
  HTTPError,
  Router,
  typedErrorHandler,
} from 'web-listener';
import type { PasswordCheckService } from '../services/PasswordCheckService';

const CACHE_CONTROL = [
  'public',
  `max-age=${30 * 24 * 60 * 60}`,
  `stale-if-error=${60 * 24 * 60 * 60}`,
  'immutable',
].join(', ');

export class ApiPasswordCheckRouter extends Router {
  public constructor(service: PasswordCheckService) {
    super();

    this.get(
      '/:range',
      async (req, res) => {
        const { range } = getPathParameters(req);

        const data = await service.getBreachesRange(range);
        res.setHeader('cache-control', CACHE_CONTROL);
        res.removeHeader('expires');
        res.removeHeader('pragma');
        return res.end(data);
      },
      typedErrorHandler(RangeError, () => {
        throw new HTTPError(400, { body: 'Invalid range' });
      }),
      conditionalErrorHandler(
        (e) => e instanceof Error && e.message === 'Service unavailable',
        (_error, _req, res) => res.writeHead(503).end(),
      ),
    );
  }
}
