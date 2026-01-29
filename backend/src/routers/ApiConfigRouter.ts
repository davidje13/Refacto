import { Router, staticJSON } from 'web-listener';
import type {
  ClientConfig,
  PasswordRequirements,
} from '../shared/api-entities';

interface ServerConfig {
  giphy: { apiKey: string };
}

export class ApiConfigRouter extends Router {
  constructor(
    serverConfig: ServerConfig,
    ssoClientConfig: ClientConfig['sso'],
    passwordRequirements: PasswordRequirements,
    maxApiKeys: number,
    deleteRetroDelay: number,
  ) {
    super();

    const clientConfig: ClientConfig = {
      sso: ssoClientConfig,
      giphy: serverConfig.giphy.apiKey !== '',
      passwordRequirements,
      maxApiKeys,
      deleteRetroDelay,
    };

    this.get(
      '/',
      staticJSON(clientConfig, {
        headers: { 'cache-control': 'public, max-age=0' },
      }),
    );
  }
}
