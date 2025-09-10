import type { Readable, Writable } from 'node:stream';
import { Agent, request } from 'node:http';
import { Router } from 'websocket-express';
import type { Logger } from '../services/LogService';

export class ForwardingRouter extends Router {
  constructor(forwardHost: string, logger: Logger) {
    super();

    const agent = new Agent({ keepAlive: true, maxSockets: 10 });
    const urlProxy = safeURLProxy(forwardHost);

    this.useHTTP((req, res) => {
      try {
        const proxyReq = request(urlProxy(req.url), {
          agent,
          method: req.method,
          headers: req.headers,
        });

        proxyReq.on('error', (err) => {
          logger.error('proxy error', err);
          if (!res.headersSent) {
            res.writeHead(502);
          }
          res.end();
        });

        proxyReq.on('response', (proxyRes) => {
          if (!res.headersSent) {
            res.writeHead(
              proxyRes.statusCode ?? 200,
              proxyRes.statusMessage,
              proxyRes.headers,
            );
          }

          pipeWithError(proxyRes, res);
        });

        pipeWithError(req, proxyReq);
      } catch (err) {
        logger.error('proxy request error', err);
        res.writeHead(400);
        res.end();
      }
    });
  }
}

function safeURLProxy(forwardHost: string) {
  const target = new URL(forwardHost);
  return (path: string) => {
    const proxyURL = new URL(path, target);
    if (!proxyURL.toString().startsWith(forwardHost)) {
      throw new Error('invalid URL');
    }
    return proxyURL;
  };
}

function pipeWithError(reader: Readable, writer: Writable) {
  reader.on('close', () => {
    if (!reader.readableEnded) {
      writer.destroy();
    }
  });

  writer.on('close', () => {
    if (!writer.writableEnded) {
      reader.destroy();
    }
  });

  if (!writer.writableEnded) {
    if (reader.readableEnded) {
      writer.end();
    } else {
      reader.pipe(writer);
    }
  }
}
