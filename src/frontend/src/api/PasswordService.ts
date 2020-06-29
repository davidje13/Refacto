import { sha1 } from '../helpers/crypto';

export default class PasswordService {
  public constructor(
    private readonly apiBase: string,
  ) {}

  public async countPasswordBreaches(password: string): Promise<number> {
    const passwordHash = (await sha1(password)).toUpperCase();
    const key = passwordHash.substr(0, 5);
    const rest = passwordHash.substr(5);

    const response = await fetch(`${this.apiBase}/password-check/${key}`);
    const lines = (await response.text()).split('\n');
    return lines.reduce((sum, ln) => {
      const [lnRest, count] = ln.split(':');
      return sum + ((lnRest === rest) ? Number(count) : 0);
    }, 0);
  }
}
