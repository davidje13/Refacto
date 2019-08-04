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

export interface RetroSummary {
  id: string;
  slug: string;
  name: string;
}

export interface RetroData {
  format: string;
  items: RetroItem[];
}

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

export interface RetroArchive {
  id: string;
  retroId: string;
  created: number;
  data: RetroData;
}

export interface RetroArchiveSummary {
  id: string;
  created: number;
}
