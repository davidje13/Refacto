import express from 'express';
import proxy from 'http-proxy-middleware';
import path from 'path';
import basedir from '../basedir';

const forwardHost = process.env.FORWARD_HOST || null;

export default class StaticRouter extends express.Router {
  constructor() {
    super();

    if (forwardHost) {
      // Dev mode: forward unknown requests to another service
      this.use(proxy({ target: forwardHost }));
    } else {
      const staticDir = path.join(basedir, 'static');

      // Production mode: all resources are copied into /static
      this.use(express.static(staticDir));

      // Single page app: serve index.html for any unknown GET request
      const indexPage = path.join(staticDir, 'index.html');
      this.get('*', (request, response) => {
        response.sendFile(indexPage);
      });
    }
  }
}
