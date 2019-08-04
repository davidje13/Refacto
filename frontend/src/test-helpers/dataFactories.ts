import {
  Retro,
  RetroData,
  RetroItem,
  RetroSummary,
  RetroArchive,
} from 'refacto-entities';

export function makeRetroData({
  format = 'none',
  items = [],
}: Partial<RetroData> = {}): RetroData {
  return {
    format,
    items,
  };
}

export function makeRetroSummary({
  id = 'my-retro-id',
  slug = 'my-slug',
  name = 'my retro name',
}: Partial<RetroSummary> = {}): RetroSummary {
  return {
    id,
    slug,
    name,
  };
}

export function makeRetro({
  format,
  items,
  ...rest
}: Partial<RetroData & Retro['retro']> = {}): Retro['retro'] {
  return Object.assign({
    name: 'my retro name',
    state: {},
    data: makeRetroData({ format, items }),
    archives: [],
  }, rest);
}

export function makeArchive({
  format,
  items,
  ...rest
}: Partial<RetroData & RetroArchive> = {}): RetroArchive {
  return Object.assign({
    id: 'my-archive-id',
    retroId: 0,
    created: 0,
    data: makeRetroData({ format, items }),
  }, rest);
}

export function makeItem(details: Partial<RetroItem> = {}): RetroItem {
  return Object.assign({
    id: 'my-id',
    category: 'none',
    created: 0,
    votes: 0,
    done: false,
    message: 'my message',
  }, details);
}
