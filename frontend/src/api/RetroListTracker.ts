import type { RetroSummary } from '../shared/api-entities';
import { jsonFetch } from './jsonFetch';

interface RetroList {
  retros: RetroSummary[];
}

export class RetroListTracker {
  constructor(private readonly apiBase: string) {}

  get(userToken: string, signal: AbortSignal): Promise<RetroList> {
    return jsonFetch(`${this.apiBase}/retros`, {
      headers: { Authorization: `Bearer ${userToken}` },
      signal,
    });
  }
}
