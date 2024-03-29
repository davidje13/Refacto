import { ReplaySubject, Subject } from 'rxjs';
import { type ClientConfig } from '../shared/api-entities';

export class ConfigService {
  private readonly config = new ReplaySubject<ClientConfig>(1);

  public constructor(private readonly apiBase: string) {}

  public async load(): Promise<void> {
    const response = await fetch(`${this.apiBase}/config`);
    this.config.next(await response.json());
  }

  public get(): Subject<ClientConfig> {
    return this.config;
  }
}
