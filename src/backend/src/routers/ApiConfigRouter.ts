import { Router } from 'websocket-express';
import { ClientConfig } from 'refacto-entities';

interface ServerConfig {
  sso: ClientConfig['sso'];
  giphy: {
    apiKey: string;
  };
}

function makeClientConfig(serverConfig: ServerConfig): ClientConfig {
  const clientConfig: ClientConfig = {
    sso: {},
    giphy: (serverConfig.giphy.apiKey !== ''),
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
  public constructor(serverConfig: ServerConfig) {
    super();

    const clientConfig = makeClientConfig(serverConfig);

    this.get('/', (req, res) => {
      res.json(clientConfig);
    });
  }
}
