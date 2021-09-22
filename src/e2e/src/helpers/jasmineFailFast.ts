// Adapted from
// https://github.com/Updater/jasmine-fail-fast/blob/master/src/index.js
// (not using npm package due to stale dependencies)

export default function register(): any {
  const env = (global.jasmine as any).getEnv();

  const specs: any[] = [];
  const suites: any[] = [];

  env.specFilter = (spec: any): boolean => {
    specs.push(spec);
    return true;
  };

  const originalDescribe = env.describe;
  env.describe = (...args: any[]): any => {
    const suite = originalDescribe(...args);
    suites.push(suite);
    return suite;
  };

  const reporter = {
    specDone(result: any): void {
      if (result.status === 'failed') {
        specs.forEach((spec) => spec.disable());
        /* eslint-disable no-param-reassign */
        suites.forEach((suite) => {
          suite.beforeFns = [];
          suite.beforeAllFns = [];
        });
        /* eslint-enable no-param-reassign */
      }
    },
  };

  env.addReporter(reporter);
}
