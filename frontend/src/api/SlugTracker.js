export default class SlugTracker {
  constructor(apiBase) {
    this.apiBase = apiBase;
    this.slugs = new Map();
  }

  load(slug, dataCallback) {
    const slugInfo = this.slugs.get(slug);
    if (slugInfo) {
      dataCallback(slugInfo);
      return;
    }

    global.fetch(`${this.apiBase}/slugs/${slug}`)
      .then((data) => data.json())
      .then((data) => {
        this.slugs.set(slug, data);
        dataCallback(data);
      });
  }
}
