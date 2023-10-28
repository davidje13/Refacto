import { Router } from 'websocket-express';
import expressStaticGzip from 'express-static-gzip';

const VERSIONED_FILE = /\..{4,}\.(css|js|woff2?)(\.(br|gz))?$/;
const VERSIONED_CACHE_CONTROL = [
  'public',
  `max-age=${365 * 24 * 60 * 60}`,
  `stale-if-error=${365 * 24 * 60 * 60}`,
  'immutable',
].join(', ');
const UNVERSIONED_CACHE_CONTROL = [
  'public',
  `max-age=${10 * 60}`,
  `stale-if-error=${24 * 60 * 60}`,
].join(', ');

export class StaticRouter extends Router {
  public constructor(staticDir: string) {
    super();

    // Production mode: all resources are copied into /static
    const staticRouter = expressStaticGzip(staticDir, {
      enableBrotli: true,
      orderPreference: ['br'],
      index: false,
      serveStatic: {
        cacheControl: false,
        redirect: false,
        setHeaders: (res, filePath): void => {
          if (VERSIONED_FILE.test(filePath)) {
            res.setHeader('cache-control', VERSIONED_CACHE_CONTROL);
          } else {
            res.setHeader('cache-control', UNVERSIONED_CACHE_CONTROL);
          }
        },
      },
    });
    this.use(staticRouter);

    // Single page app: serve index.html for any unknown GET request
    this.get('*', (req, res, next) => {
      req.url = '/index.html';
      res.header('Link', '</api/config>; rel=preload; as=fetch; crossorigin');
      staticRouter(req, res, next);
    });
  }
}
