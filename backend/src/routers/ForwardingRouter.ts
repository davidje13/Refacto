import { Router } from 'websocket-express';

export class ForwardingRouter extends Router {
  static async to(forwardHost: string, diagnostics: Diagnostics) {
    const { default: httpProxy } = await import('http-proxy');
    const proxy = httpProxy.createProxyServer({ target: forwardHost });

    proxy.on('error', (err, _req, res) => {
      diagnostics.error('proxy error', err);
      if ('writeHead' in res && !res.headersSent) {
        res.writeHead(502);
      }
      res.end();
    });

    // Patch issue with old API use in http-proxy
    // https://github.com/chimurai/http-proxy-middleware/issues/678
    // https://github.com/http-party/node-http-proxy/issues/1520#issue-877626125
    // https://github.com/http-party/node-http-proxy/pull/1580
    // https://github.com/http-party/node-http-proxy/pull/1559
    proxy.on('proxyRes', (proxyRes, _req, res) => {
      res.on('close', () => {
        if (!res.writableEnded) {
          proxyRes.destroy();
        }
      });
    });

    const r = new ForwardingRouter();
    r.useHTTP((req, res) => proxy.web(req, res));
    return r;
  }
}

interface Diagnostics {
  error(message: string, err: unknown): void;
}
