import { CacheMap } from '../helpers/CacheMap';
import { AsyncValue } from '../helpers/AsyncValue';
import type { RetroAuth } from '../shared/api-entities';
import { localStore } from '../helpers/storage';

const MINIMUM_VALIDITY = 1000 * 60 * 60 * 12;

export class RetroAuthTracker extends CacheMap<string, AsyncValue<RetroAuth>> {
  constructor() {
    super((retroId) => {
      const value = new AsyncValue<RetroAuth>();
      try {
        const stored = localStore.getItem(storageKey(retroId));
        if (stored) {
          const auth: RetroAuth = JSON.parse(stored);
          if (Date.now() + MINIMUM_VALIDITY < auth.expires) {
            if (!auth.scopes) {
              // migration for old persisted data (can be removed ~ end 2026)
              try {
                auth.scopes = Object.keys(
                  JSON.parse(atob(auth.retroToken.split('.')[1]!)).scopes,
                );
              } catch {
                auth.scopes = [];
              }
            }
            value.set(auth);
          }
        }
      } catch {}
      return value;
    });
  }

  set(retroId: string, auth: RetroAuth, persist?: boolean) {
    if (persist) {
      localStore.setItem(storageKey(retroId), JSON.stringify(auth));
    } else if (persist === false) {
      localStore.removeItem(storageKey(retroId));
    }
    this.get(retroId).set(auth);
  }
}

const storageKey = (retroId: string) => `retro-token-${retroId}`;
