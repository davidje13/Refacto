import { Router } from 'websocket-express';
import type { RequestHandler } from 'http-proxy-middleware';

const filteredLogger = {
  info: () => null,
  warn: console.warn,
  error: console.error,
};

export class ForwardingRouter extends Router {
  private constructor(httpHandler: RequestHandler) {
    super();
    this.useHTTP(httpHandler);
  }

  static async to(forwardHost: string) {
    const { createProxyMiddleware } = await import('http-proxy-middleware');
    return new ForwardingRouter(
      createProxyMiddleware({ target: forwardHost, logger: filteredLogger }),
    );
  }
}
