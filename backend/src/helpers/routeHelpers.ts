import type { RequestHandler } from 'express';

export function safe<H extends RequestHandler>(handler: H): H {
  return (async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (e) {
      next(e);
    }
  }) as H;
}
