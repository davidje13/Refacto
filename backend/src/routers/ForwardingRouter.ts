import { Router } from 'websocket-express';
import type { RequestHandler } from 'http-proxy-middleware';

export class ForwardingRouter extends Router {
  private constructor(httpHandler: RequestHandler) {
    super();
    this.useHTTP(httpHandler);
  }

  static async to(forwardHost: string) {
    const { createProxyMiddleware } = await import('http-proxy-middleware');
    return new ForwardingRouter(
      createProxyMiddleware({ target: forwardHost, logLevel: 'warn' }),
    );
  }
}
