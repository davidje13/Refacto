import { Router, staticContent } from 'web-listener';
import { openapi } from './openapi';

const devMode = process.env['NODE_ENV'] === 'development';

export class ApiSpecRouter extends Router {
  public constructor() {
    super();

    this.get(
      '/openapi.json',
      staticContent(openapi, 'application/openapi+json', {
        headers: {
          'cache-control': devMode
            ? 'public, max-age=0'
            : `public, max-age=${10 * 60}, stale-if-error=${365 * 24 * 60 * 60}`,
        },
        encodings: ['br', 'gzip', 'deflate'],
      }),
    );
  }
}
