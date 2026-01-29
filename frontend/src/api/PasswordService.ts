import { digest, toHex } from '../helpers/crypto';

export class PasswordService {
  constructor(private readonly apiBase: string) {}

  async countPasswordBreaches(
    password: string,
    signal: AbortSignal,
  ): Promise<number> {
    const passwordHash = toHex(await digest(password, 'SHA-1')).toUpperCase();
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
