import { Router, sendJSON } from 'web-listener';
import type { ClientConfig } from '../shared/api-entities';

interface ServerConfig {
  giphy: { apiKey: string };
}

export class ApiConfigRouter extends Router {
  public constructor(
    serverConfig: ServerConfig,
    ssoClientConfig: ClientConfig['sso'],
  ) {
    super();

    const clientConfig: ClientConfig = {
      sso: ssoClientConfig,
      giphy: serverConfig.giphy.apiKey !== '',
    };

    this.get('/', (_, res) => sendJSON(res, clientConfig));
  }
}
