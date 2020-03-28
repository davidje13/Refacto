import { Router } from 'websocket-express';
import type PasswordCheckService from '../services/PasswordCheckService';

const VALID_RANGE = /^[0-9A-Z]{5}$/;

const MAX_AGE = 60 * 60 * 24 * 30;

export default class ApiPasswordCheckRouter extends Router {
  public constructor(service: PasswordCheckService) {
    super();

    this.get('/:range', async (req, res) => {
      const { range } = req.params;

      if (!VALID_RANGE.test(range)) {
        res.status(400).end();
      }

      try {
        const data = await service.getBreachesRange(range);
        res.header('cache-control', `public, max-age=${MAX_AGE}, immutable`);
        res.removeHeader('expires');
        res.removeHeader('pragma');
        res.end(data);
      } catch (err) {
        res.status(500).end();
      }
    });
  }
}
