import type { ClientConfig } from '../shared/api-entities';
import { jsonFetch } from './jsonFetch';

export class ConfigService {
  public constructor(private readonly apiBase: string) {}

  public get(): Promise<ClientConfig> {
    return jsonFetch(`${this.apiBase}/config`, {});
  }
}
