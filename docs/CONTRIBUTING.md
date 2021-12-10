# Refacto - Contributing

## Running locally

```bash
npm start
```

The site (both frontend resources and backend API) will be available at
<http://localhost:5000/>. Both will automatically rebuild if changed.

By default, this will run a mock Google authentication provider and an
in-memory database. To enable real authentication providers (e.g.
Google sign in) and data persistence, see the
[services documentation](./SERVICES.md).

## Running tests

Run all tests:

```bash
npm test
```

*Note:* the end-to-end tests will be skipped unless you have installed
`chromedriver` and/or `geckodriver`. You can find these at:

* <https://chromedriver.chromium.org/downloads>
* <https://github.com/mozilla/geckodriver/releases>

After downloading, unpack the files and run:

```bash
install chromedriver /usr/local/bin
install geckodriver /usr/local/bin
```

### Testing frontend only

```bash
npm run test:frontend
```

Watch mode:

```bash
npm run test:frontend:watch
```

### Testing backend only

```bash
npm run test:backend
```

Watch mode:

```bash
npm run test:backend:watch
```

### End-to-end tests only

To automatically build and run the server, and run tests against it:

```bash
npm run test:e2e
```

During development, the build time can be significant. An alternative
is to run the application in the background in watch mode using
`npm start -- --mock-sso` (this differs from `npm start` because it
uses a mock Google single-sign-on endpoint even if you have configured
a real client ID), then run the end-to-end tests against that
deployment:

```bash
TARGET_HOST=http://localhost:5000/ npm run test:e2e
```

Run end-to-end tests with non-headless browsers:

```bash
HEADLESS=false npm run test:e2e
```

The server logs generated during the end-to-end test run are written
to `src/e2e/build/app.log`.

## Building

```bash
npm run build
```

The output will be placed in `build`. Specify the `PORT` environment
variable when running (defaults to 5000):

```bash
cd build
npm install --production
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

```bash
cd src/frontend
npm install --save react
npm install --save-dev jest
```

```bash
cd src/backend
npm install --save express
npm install --save-dev supertest
```

```bash
cd src/e2e
npm install --save-dev selenium-webdriver
```

## Browser Support

The latest versions of Google Chrome and Mozilla Firefox are supported,
and the end-to-end tests will run in both if the necessary drivers are
installed (see [Running tests](#running-tests)).

## Library documentation

- React: <https://reactjs.org/docs/react-api.html>
- `update`: <https://github.com/davidje13/json-immutability-helper>
- Wouter: <https://github.com/molefrog/wouter>
- Jest: <https://jestjs.io/docs/en/api>
- Flexible Testing Library React <https://github.com/davidje13/flexible-testing-library-react>
- Jest DOM Matchers <https://github.com/testing-library/jest-dom>
- Supertest: <https://github.com/visionmedia/supertest> and <https://visionmedia.github.io/superagent/>
- Selenium: <https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/>

## Troubleshooting

### `error:0308010C:digital envelope routines::unsupported`

This project uses an old version of WebPack which is incompatible with Node 17. You can either
downgrade to Node 16, or use the following command to build:

```bash
NODE_OPTIONS=--openssl-legacy-provider npm run build
```

(same change for `test` etc.)

Specifically, WebPack uses an old OpenSSL algorithm for generating file hashes. This is not a
security risk, and the resulting executable can (and should) be executed without using the
legacy provider.
