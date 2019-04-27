import { Router } from 'websocket-express';

function makeClientConfig(serverConfig) {
  const clientConfig = {
    sso: {},
  };

  Object.keys(serverConfig.sso).forEach((service) => {
    const config = serverConfig.sso[service];
    if (config.clientId) {
      clientConfig.sso[service] = {
        authUrl: config.authUrl,
        clientId: config.clientId,
      };
    }
  });

  return clientConfig;
}

export default class ApiConfigRouter extends Router {
  constructor(serverConfig) {
    super();

    const clientConfig = makeClientConfig(serverConfig);

    this.get('/', (req, res) => {
      res.json(clientConfig);
    });
  }
}
