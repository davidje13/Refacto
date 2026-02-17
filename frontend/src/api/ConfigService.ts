import type { ClientConfig } from '../shared/api-entities';
import { jsonFetch } from './jsonFetch';

export class ConfigService {
  constructor(private readonly apiBase: string) {}

  get(): Promise<ClientConfig> {
    return jsonFetch(`${this.apiBase}/config`, {
      priority: 'high',

      // Safari's preload handling is a bit fragile / broken, and does not
      // understand crossorigin="anonymous". These settings have been found
      // to support preloading in both Chrome and Safari. In practice, the
      // URL is always same-origin, and we do not have any cookies anyway,
      // so credentials:include is safe.
      credentials: 'include',
      mode: 'no-cors',
    });
  }
}
