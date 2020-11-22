import WebSocketExpress from 'websocket-express';
import expressStaticGzip from 'express-static-gzip';
import path from 'path';
import basedir from '../basedir';

const VERSIONED_FILE = /\..{4,}\.(css|js|woff2?)(\.(br|gz))?$/;
const VERSIONED_CACHE_CONTROL = `public, max-age=${365 * 24 * 60 * 60}, stale-if-error=${365 * 24 * 60 * 60}, immutable`;
const UNVERSIONED_CACHE_CONTROL = `public, max-age=${10 * 60}, stale-if-error=${24 * 60 * 60}`;

export default class StaticRouter extends WebSocketExpress.Router {
  public constructor(forwardHost: string | null = null) {
    super();

    if (forwardHost) {
      // Dev mode: forward unknown requests to another service
      import('http-proxy-middleware')
        .then(({ createProxyMiddleware }) => {
          this.useHTTP(createProxyMiddleware({ target: forwardHost, logLevel: 'warn' }));
        })
        .catch((e) => {
          process.stderr.write((
            `Failed to apply frontend forwarding to ${forwardHost} ` +
            '(only API will be available)\n'
          ));
          process.stderr.write(`${e.message}\n`);
        });
    } else {
      const staticDir = path.join(basedir, 'static');

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
}
