export interface ClientConfig {
  sso: {
    [service: string]: {
      authUrl: string;
      clientId: string;
    };
  };
}

export interface RetroItem {
  id: string;
  category: string;
  created: number;
  message: string;
  votes: number;
  doneTime: number;
}

export function makeRetroItem(details: Partial<RetroItem> = {}): RetroItem {
  return Object.assign({
    id: '',
    category: '',
    created: 0,
    message: '',
    votes: 0,
    doneTime: 0,
  }, details);
}

export interface RetroSummary {
  id: string;
  slug: string;
  name: string;
}

export interface RetroData {
  format: string;
  options: Record<string, unknown>;
  items: RetroItem[];
}

export interface Retro<StateT = Record<string, unknown>> extends RetroSummary, RetroData {
  ownerId: string;
  state: StateT;
}

export function makeRetro(details: Partial<Retro> = {}): Retro {
  return Object.assign({
    id: '',
    slug: '',
    name: '',
    ownerId: '',
    state: {},
    format: '',
    options: {},
    items: [],
  }, details);
}

export interface RetroArchiveSummary {
  id: string;
  created: number;
}

export interface RetroArchive extends RetroArchiveSummary, RetroData {
  retroId: string;
}

export function makeRetroArchive(details: Partial<RetroArchive> = {}): RetroArchive {
  return Object.assign({
    id: '',
    retroId: '',
    created: 0,
    format: '',
    options: {},
    items: [],
  }, details);
}
