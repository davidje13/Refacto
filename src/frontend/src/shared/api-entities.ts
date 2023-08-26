export type JsonData =
  | { [P: string]: JsonData }
  | JsonData[]
  | string
  | number
  | boolean
  | null;

export interface ClientConfig {
  sso: {
    [service: string]: {
      authUrl: string;
      clientId: string;
    };
  };
  giphy: boolean;
}

export interface RetroItemAttachment {
  type: string;
  url: string;
}

export interface UserProvidedRetroItemDetails {
  message: string;
  attachment: RetroItemAttachment | null;
}

export interface RetroItem extends UserProvidedRetroItemDetails {
  id: string;
  category: string;
  created: number;
  votes: number;
  doneTime: number;
  group?: string | undefined;
}

export function makeRetroItem(details: Partial<RetroItem> = {}): RetroItem {
  return {
    id: '',
    category: '',
    created: 0,
    message: '',
    attachment: null,
    votes: 0,
    doneTime: 0,
    group: undefined,
    ...details,
  };
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

type AnyState = Record<string, unknown>;

export interface Retro<StateT = AnyState> extends RetroSummary, RetroData {
  ownerId: string;
  state: StateT;
  groupStates: Record<string, StateT>;
}

export function makeRetro(details: Partial<Retro> = {}): Retro {
  return {
    id: '',
    slug: '',
    name: '',
    ownerId: '',
    state: {},
    groupStates: {},
    format: '',
    options: {},
    items: [],
    ...details,
  };
}

export interface RetroArchiveSummary {
  id: string;
  created: number;
}

export interface RetroArchive extends RetroArchiveSummary, RetroData {
  imported: number | null;
  retroId: string;
}

export function makeRetroArchive(
  details: Partial<RetroArchive> = {},
): RetroArchive {
  return {
    id: '',
    retroId: '',
    created: 0,
    imported: null,
    format: '',
    options: {},
    items: [],
    ...details,
  };
}
