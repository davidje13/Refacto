import { Router } from 'websocket-express';
import type { ClientConfig } from 'refacto-entities';
import type { AuthenticationClientConfiguration } from 'auth-backend';

interface ServerConfig {
  sso: ClientConfig['sso'];
  giphy: {
    apiKey: string;
  };
}

export default class ApiConfigRouter extends Router {
  public constructor(
    serverConfig: ServerConfig,
    ssoClientConfig: AuthenticationClientConfiguration,
  ) {
    super();

    const clientConfig = {
      sso: ssoClientConfig,
      giphy: (serverConfig.giphy.apiKey !== ''),
    };

    this.get('/', (req, res) => res.json(clientConfig));
  }
}
