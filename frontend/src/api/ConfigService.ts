import { ReplaySubject, Subject } from 'rxjs';

export interface ClientConfig {
  sso: {
    [service: string]: {
      authUrl: string;
      clientId: string;
    };
  };
}

export default class ConfigService {
  private readonly config = new ReplaySubject<ClientConfig>(1);

  public constructor(
    private readonly apiBase: string,
  ) {}

  public async load(): Promise<void> {
    const response = await fetch(`${this.apiBase}/config`);
    this.config.next(await response.json());
  }

  public get(): Subject<ClientConfig> {
    return this.config;
  }
}
