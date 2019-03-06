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
  uuid = 'my-retro-uuid',
  slug = 'my-slug',
  name = 'my retro name',
} = {}) {
  return {
    uuid,
    slug,
    name,
  };
}

export function makeRetro(details = {}) {
  const { format, items, ...rest } = details;

  return Object.assign({
    uuid: 'my-retro-uuid',
    slug: 'my-slug',
    name: 'my retro name',
    state: {},
    data: makeRetroData({ format, items }),
    archives: [],
  }, rest);
}

export function makeArchive(details = {}) {
  const { format, items, ...rest } = details;

  return Object.assign({
    uuid: 'my-archive-uuid',
    created: 0,
    retro: {
      uuid: 'my-retro-uuid',
      slug: 'my-slug',
      name: 'my retro name',
    },
    data: makeRetroData({ format, items }),
  }, rest);
}

export function makeItem(details = {}) {
  return Object.assign({
    uuid: 'my-uuid',
    category: 'none',
    created: 0,
    votes: 0,
    done: false,
    message: 'my message',
  }, details);
}
