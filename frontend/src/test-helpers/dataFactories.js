export function makeRetro(details = {}) {
  return Object.assign({
    slug: 'my-slug',
    name: 'my retro name',
    format: 'none',
    state: {},
    items: [],
  }, details);
}

export function makeItem(details = {}) {
  return Object.assign({
    uuid: 'my-uuid',
    category: 'none',
    created: 0,
    message: 'my message',
  }, details);
}
