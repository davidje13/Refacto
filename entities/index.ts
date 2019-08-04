export interface RetroItem {
  id: string;
  category: string;
  created: number;
  message: string;
  votes: number;
  done: boolean;
}

export function makeRetroItem(details: Partial<RetroItem> = {}): RetroItem {
  return Object.assign({
    id: '',
    category: '',
    created: 0,
    message: '',
    votes: 0,
    done: false,
  }, details);
}

export interface RetroData {
  format: string;
  items: RetroItem[];
}

export function makeRetroData({
  format = '',
  items = [],
}: Partial<RetroData> = {}): RetroData {
  return { format, items };
}

export interface Retro {
  id: string;
  ownerId: string;
  slug: string;
  retro: {
    name: string;
    state: object;
    data: RetroData;
  };
}

export function makeRetro({
  format,
  items,
  ...details
}: Partial<RetroData & Retro['retro']> = {}): Retro['retro'] {
  return Object.assign({
    name: '',
    state: {},
    data: makeRetroData({ format, items }),
  }, details);
}

export interface RetroSummary {
  id: string;
  slug: string;
  name: string;
}

export function makeRetroSummary(details: Partial<RetroSummary> = {}): RetroSummary {
  return Object.assign({
    id: '',
    slug: '',
    name: '',
  }, details);
}

export interface RetroArchive {
  id: string;
  retroId: string;
  created: number;
  data: RetroData;
}

export function makeRetroArchive({
  format,
  items,
  ...details
}: Partial<RetroData & RetroArchive> = {}): RetroArchive {
  return Object.assign({
    id: '',
    retroId: 0,
    created: 0,
    data: makeRetroData({ format, items }),
  }, details);
}

export interface RetroArchiveSummary {
  id: string;
  created: number;
}
