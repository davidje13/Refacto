import express from 'express';
import proxy from 'http-proxy-middleware';
import path from 'path';
import basedir from '../basedir';

const forwardHost = process.env.FORWARD_HOST || null;

const router = new express.Router();

if (forwardHost) {
  // Dev mode: forward unknown requests to another service
  router.use(proxy({ target: forwardHost }));
} else {
  const staticDir = path.join(basedir, 'static');

  // Production mode: all resources are copied into /static
  router.use(express.static(staticDir));

  // Single page app: serve index.html for any unknown GET request
  const indexPage = path.join(staticDir, 'index.html');
  router.get('*', (request, response) => {
    response.sendFile(indexPage);
  });
}

export default router;
