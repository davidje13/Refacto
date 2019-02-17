# Refacto - Contributing

## Running locally

```bash
npm install
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
npm --prefix=frontend test
```

Watch mode:

```bash
npm --prefix=frontend test -- --watchAll
```

### Testing backend only

```bash
npm --prefix=backend test
```

Watch mode:

```bash
npm --prefix=backend test -- --watchAll
```

### End-to-end tests only

To automatically build and run the server, and run tests against it:

```bash
npm run test:e2e
```

Run end-to-end tests against an existing server:

```bash
TARGET_HOST=http://localhost:8080/ npm run test:e2e
```

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

## Library documentation

- React: <https://reactjs.org/docs/react-api.html>
- Jest: <https://jestjs.io/docs/en/api>
- Supertest: <https://github.com/visionmedia/supertest> and <https://visionmedia.github.io/superagent/>
- Selenium: <https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/>
