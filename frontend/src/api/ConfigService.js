import { ReplaySubject } from 'rxjs';

export default class ConfigService {
  constructor(apiBase) {
    this.apiBase = apiBase;
    this.config = new ReplaySubject(1);
  }

  async load() {
    const response = await fetch(`${this.apiBase}/config`);
    this.config.next(await response.json());
  }

  get() {
    return this.config;
  }
}
