import WebSocketExpress from 'websocket-express';
import path from 'path';
import basedir from '../basedir';

export default class StaticRouter extends WebSocketExpress.Router {
  constructor(forwardHost = null) {
    super();

    if (forwardHost) {
      // Dev mode: forward unknown requests to another service
      import('http-proxy-middleware')
        .then(({ default: proxy }) => {
          this.useHTTP(proxy({ target: forwardHost }));
        })
        .catch(() => {
          process.stderr.write((
            'Failed to apply frontend forwarding ' +
            '(only API will be available)\n'
          ));
        });
    } else {
      const staticDir = path.join(basedir, 'static');

      // Production mode: all resources are copied into /static
      this.use(WebSocketExpress.static(staticDir));

      // Single page app: serve index.html for any unknown GET request
      const indexPage = path.join(staticDir, 'index.html');
      this.get('*', (request, response) => {
        response.sendFile(indexPage);
      });
    }
  }
}
