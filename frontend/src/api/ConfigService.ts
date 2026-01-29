import type { ClientConfig } from '../shared/api-entities';
import { jsonFetch } from './jsonFetch';

export class ConfigService {
  constructor(private readonly apiBase: string) {}

  get(): Promise<ClientConfig> {
    return jsonFetch(`${this.apiBase}/config`, {});
  }
}
