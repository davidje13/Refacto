import { Router } from 'websocket-express';

interface ClientConfig {
  sso: {
    [service: string]: {
      authUrl: string;
      clientId: string;
    };
  };
}

type ServerConfig = ClientConfig;

function makeClientConfig(serverConfig: ServerConfig): ClientConfig {
  const clientConfig: ClientConfig = {
    sso: {},
  };

  Object.keys(serverConfig.sso).forEach((service): void => {
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

    this.get('/', (req, res): void => {
      res.json(clientConfig);
    });
  }
}
