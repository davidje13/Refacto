interface Config {
  baseUrl: string;
}

const VALID_RANGE = /^[0-9A-Z]{5}$/;

export class PasswordCheckService {
  private readonly baseUrl: string;

  public constructor(config: Config) {
    this.baseUrl = config.baseUrl;
  }

  public async getBreachesRange(prefix: string): Promise<string> {
    if (!VALID_RANGE.test(prefix)) {
      throw new Error('Invalid range prefix');
    }
    if (!this.baseUrl) {
      throw new Error('Service unavailable');
    }

    const result = await fetch(`${this.baseUrl}/range/${prefix}`);
    if (result.status !== 200) {
      throw new Error(`Service error ${result.status}`);
    }
    return result.text();
  }
}
