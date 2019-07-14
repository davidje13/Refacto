import { Observable } from 'rxjs';
import loadHttp from '../rxjs/loadHttp';
import RetroSummary from '../data/RetroSummary';

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
