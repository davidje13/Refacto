import { Router } from 'websocket-express';
import type { ClientConfig } from '../shared/api-entities';
import type { AuthenticationClientConfiguration } from 'authentication-backend';

interface ServerConfig {
  sso: ClientConfig['sso'];
  giphy: {
    apiKey: string;
  };
}

export class ApiConfigRouter extends Router {
  public constructor(
    serverConfig: ServerConfig,
    ssoClientConfig: AuthenticationClientConfiguration,
  ) {
    super();

    const clientConfig = {
      sso: ssoClientConfig,
      giphy: serverConfig.giphy.apiKey !== '',
    };

    this.get('/', (_, res) => res.json(clientConfig));
  }
}
