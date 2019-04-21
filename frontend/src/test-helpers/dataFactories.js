export function makeRetroData({
  format = 'none',
  items = [],
} = {}) {
  return {
    format,
    items,
  };
}

export function makeRetroSummary({
  id = 'my-retro-id',
  slug = 'my-slug',
  name = 'my retro name',
} = {}) {
  return {
    id,
    slug,
    name,
  };
}

export function makeRetro(details = {}) {
  const { format, items, ...rest } = details;

  return Object.assign({
    name: 'my retro name',
    state: {},
    data: makeRetroData({ format, items }),
    archives: [],
  }, rest);
}

export function makeArchive(details = {}) {
  const { format, items, ...rest } = details;

  return Object.assign({
    id: 'my-archive-id',
    created: 0,
    data: makeRetroData({ format, items }),
  }, rest);
}

export function makeItem(details = {}) {
  return Object.assign({
    id: 'my-id',
    category: 'none',
    created: 0,
    votes: 0,
    done: false,
    message: 'my message',
  }, details);
}
