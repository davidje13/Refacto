export default class SlugTracker {
  constructor(apiBase) {
    this.apiBase = apiBase;
    this.slugs = new Map();
  }

  async getSlugInfo(slug) {
    let slugInfo = this.slugs.get(slug);
    if (!slugInfo) {
      slugInfo = await global.fetch(`${this.apiBase}/slugs/${slug}`)
        .then((data) => data.json());
      this.slugs.set(slug, slugInfo);
    }
    return slugInfo;
  }

  clearSlugInfo(slug) {
    this.slugs.delete(slug);
  }
}
