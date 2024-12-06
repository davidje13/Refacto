import JSDOMEnvironment from 'jest-environment-jsdom';

export default class PatchedJSDOMEnvironment extends JSDOMEnvironment {
  constructor(...args: ConstructorParameters<typeof JSDOMEnvironment>) {
    super(...args);

    // https://github.com/jsdom/jsdom/issues/2524
    this.global.TextEncoder = TextEncoder;

    // https://github.com/jsdom/jsdom/issues/1724
    this.global.Response = Response;
  }
}
