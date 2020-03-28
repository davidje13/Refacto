import type { Observable } from 'rxjs';
import type { RetroSummary } from 'refacto-entities';
import loadHttp from '../rxjs/loadHttp';

interface RetroList {
  retros: RetroSummary[];
}

export default class RetroListTracker {
  public constructor(
    private readonly apiBase: string,
  ) {}

  public get(userToken: string): Observable<RetroList> {
    return loadHttp<RetroList>({
      url: `${this.apiBase}/retros`,
      headers: { Authorization: `Bearer ${userToken}` },
    });
  }
}
