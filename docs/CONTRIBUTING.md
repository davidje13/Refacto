# Refacto - Contributing

## Running locally

```sh
npm start
```

The site (both frontend resources and backend API) will be available at
<http://localhost:5000/>. The frontend will automatically rebuild if
changed, but the backend will not (looking for a good Rollup HMR plugin!)

By default, this will run a mock Google authentication provider and an
in-memory database. To enable real authentication providers (e.g.
Google sign in) and data persistence, see the
[services documentation](./SERVICES.md).

## Running tests

Run all tests:

```sh
npm test
```

### Testing frontend only

```sh
npm run test:frontend
```

Watch mode:

```sh
npm run test:frontend:watch
```

### Testing backend only

```sh
npm run test:backend
```

### End-to-end tests only

To automatically build and run the server, and run tests against it:

```sh
npm run test:e2e
```

During development, the build time can be significant. An alternative
is to run the application in the background in watch mode using
`npm start -- --mock-sso` (this differs from `npm start` because it
uses a mock Google single-sign-on endpoint even if you have configured
a real client ID), then run the end-to-end tests against that
deployment:

```sh
TARGET_HOST=http://localhost:5000/ MODE=dev npm run test:e2e
```

(`MODE=dev` disables the download time test, as the site is much
larger when built in dev mode via `npm start`)

Run end-to-end tests with non-headless browsers:

```sh
HEADLESS=false npm run test:e2e
```

The server logs generated during the end-to-end test run are written
to `src/e2e/build/app.log`.

## Building

```sh
npm run build
```

The output will be placed in `build`. Specify the `PORT` environment
variable when running (defaults to 5000):

```sh
cd build
npm install --omit=dev
PORT=8080 ./index.js
```

By default, no sign on services will be available. To use the Refacto Local
Testing accounts, specify:

```
SSO_GOOGLE_CLIENT_ID=199202234207-la0v05druske1f1qoimg3sgkpua2nvc7.apps.googleusercontent.com \
SSO_GITLAB_CLIENT_ID=e4f936ea33a9b725e8c210fb72fd46ebd9688a46b975e5a8d40c79734e9fc00e \
./index.js
```

This client ID is configured for use on `localhost` on ports 80, 443, 8080,
8443, and 5000. The client secret is not required, as Refacto does not access
any personal data.

See the [services documentation](./SERVICES.md) for details on
setting up a database and integrating with authentication providers.

See the [security documentation](./SECURITY.md) for additional
considerations when running in production.

## Dependency management

Add dependencies within the `backend`, `frontend` or `e2e` directories;
not in the root of the project.

Remember that runtime dependencies should be installed with `--save`,
and build / test dependencies should be installed with `--save-dev`.

### Examples

```sh
cd src/frontend
npm install --save react
npm install --save-dev jest
```

```sh
cd src/backend
npm install --save express
npm install --save-dev supertest
```

```sh
cd src/e2e
npm install --save-dev selenium-webdriver
```

## Browser Support

The latest versions of Google Chrome and Mozilla Firefox are supported,
and the end-to-end tests will run in both (see [Running tests](#running-tests)).

## Library documentation

- React: <https://reactjs.org/docs/react-api.html>
- `update`: <https://github.com/davidje13/json-immutability-helper>
- Wouter: <https://github.com/molefrog/wouter>
- Jest: <https://jestjs.io/docs/en/api>
- Flexible Testing Library React <https://github.com/davidje13/flexible-testing-library-react>
- Jest DOM Matchers <https://github.com/testing-library/jest-dom>
- Supertest: <https://github.com/visionmedia/supertest> and <https://visionmedia.github.io/superagent/>
- Selenium: <https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/>
