import { Router, sendJSON } from 'web-listener';
import type {
  ClientConfig,
  PasswordRequirements,
} from '../shared/api-entities';

interface ServerConfig {
  giphy: { apiKey: string };
}

export class ApiConfigRouter extends Router {
  public constructor(
    serverConfig: ServerConfig,
    ssoClientConfig: ClientConfig['sso'],
    passwordRequirements: PasswordRequirements,
  ) {
    super();

    const clientConfig: ClientConfig = {
      sso: ssoClientConfig,
      giphy: serverConfig.giphy.apiKey !== '',
      passwordRequirements,
    };

    this.get('/', (_, res) => sendJSON(res, clientConfig));
  }
}
