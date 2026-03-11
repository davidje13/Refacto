import type { ClientConfig } from '../shared/api-entities';
import { jsonFetch } from './jsonFetch';

export class ConfigService {
  constructor(private readonly apiBase: string) {}

  get(): Promise<ClientConfig> {
    const meta = document.head.dataset['config'];
    if (meta) {
      return Promise.resolve(JSON.parse(meta));
    }
    return jsonFetch(`${this.apiBase}/config`, { priority: 'high' });
  }
}
