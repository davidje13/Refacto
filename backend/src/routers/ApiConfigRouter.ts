import { Router, staticJSON } from 'web-listener';
import type { ClientConfig } from '@refacto/shared/api-entities';

export class ApiConfigRouter extends Router {
  constructor(clientConfig: ClientConfig) {
    super();

    this.get(
      '/',
      staticJSON(clientConfig, {
        headers: { 'cache-control': 'public, max-age=0' },
      }),
    );
  }
}
