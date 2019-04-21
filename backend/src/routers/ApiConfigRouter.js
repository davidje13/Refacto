import { Router } from 'websocket-express';

export default class ApiConfigRouter extends Router {
  constructor(clientConfig) {
    super();

    this.get('/', async (req, res) => {
      res.json(clientConfig);
    });
  }
}
