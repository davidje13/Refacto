# Refacto - Contributing

## Running locally

```bash
npm start
```

The site (both frontend resources and backend API) will be available at
<http://localhost:5000/>. Both will automatically rebuild if changed.

## Running tests

Run all tests:

```bash
npm test
```

*Note:* the end-to-end tests will be skipped unless you have installed
`chromedriver` and/or `geckodriver`. You can find these at:

* <http://chromedriver.chromium.org/downloads>
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
`npm start`, then run the end-to-end tests against that deployment:

```bash
TARGET_HOST=http://localhost:5000/ npm run test:e2e
```

(this can also be used to target external deployments for smoke testing).

Run end-to-end tests with non-headless browsers:

```bash
HEADLESS=false npm run test:e2e
```

## Building

```bash
npm run build
```

The output will be placed in `build`. Specify the `PORT` environment
variable when running (defaults to 5000):

```bash
cd build
npm install --production
PORT=8080 npm start
```

## Dependency management

Add dependencies within the `backend`, `frontend` or `e2e` directories;
not in the root of the project.

Remember that runtime dependies should be installed with `--save`, and
build / test dependencies should be installed with `--save-dev`.

### Examples

```bash
cd frontend
npm install --save react
npm install --save-dev jest
```

```bash
cd backend
npm install --save express
npm install --save-dev supertest
```

```bash
cd e2e
npm install --save-dev selenium-webdriver
```

## Conventions

* All React component files include both a named and default export.
  The named export is used in testing, and the default export is used
  in real code. Sometimes these are the same object, but often the
  default export will include redux or memo wrapping.

## Browser Support

The latest versions of Google Chrome and Mozilla Firefox are supported,
and the end-to-end tests will run in both if the necessary drivers are
installed (see [Running tests](#running-tests)).

## Library documentation

- React: <https://reactjs.org/docs/react-api.html>
- Redux: <https://redux.js.org/api/api-reference>
- Redux `update`: <https://github.com/davidje13/json-immutability-helper> / <https://github.com/kolodny/immutability-helper>
- React Router: <https://reacttraining.com/react-router/web/api>
- Jest: <https://jestjs.io/docs/en/api>
- Enzyme: <https://github.com/airbnb/enzyme>
- Jest Enzyme Matchers: <https://github.com/FormidableLabs/enzyme-matchers/tree/master/packages/jest-enzyme>
- Supertest: <https://github.com/visionmedia/supertest> and <https://visionmedia.github.io/superagent/>
- Selenium: <https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/>
