const storage = new WeakMap();

export default {
  set: (element, props) => storage.set(element, props),
  get: (element) => (storage.get(element) || {}),
};
