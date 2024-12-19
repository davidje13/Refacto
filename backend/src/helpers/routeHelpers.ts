import type { RequestHandler } from 'express';

// express 4.x does not handle asynchronous errors - if an asynchronous operation fails, it will crash the server
// we defend against this by wrapping all async handlers in this function, which mimics the behaviour of express 5.x
export function safe<P = unknown>(
  handler: RequestHandler<P>,
): RequestHandler<P> {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (e) {
      next(e);
    }
  };
}
