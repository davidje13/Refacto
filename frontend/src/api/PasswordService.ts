import { sha1 } from '../helpers/crypto';

export class PasswordService {
  public constructor(private readonly apiBase: string) {}

  public async countPasswordBreaches(
    password: string,
    signal: AbortSignal,
  ): Promise<number> {
    const passwordHash = (await sha1(password)).toUpperCase();
    const key = passwordHash.substring(0, 5);
    const rest = passwordHash.substring(5);

    const response = await fetch(
      `${this.apiBase}/password-check/${encodeURIComponent(key)}`,
      { signal },
    );
    const lines = (await response.text()).split('\n');
    return lines.reduce((sum, ln) => {
      const [lnRest, count] = ln.split(':');
      return sum + (lnRest === rest ? Number(count) : 0);
    }, 0);
  }
}
