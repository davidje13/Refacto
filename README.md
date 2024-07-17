# Refacto

A complete from-scratch re-write of
[Postfacto](https://github.com/vmware-archive/postfacto), with a focus on
simplified code, development, and deployment.

![Refacto](docs/screenshot.png)

## Running locally

Requires [Node.js 18 or above](https://nodejs.org/en/).

```sh
npm start
```

The site will be available at <http://localhost:5000/>, using a mock
Google authentication server and an in-memory database.

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for full guidance on local
development.

## Building for deployment

You can find pre-built releases at
[Refacto/releases](https://github.com/davidje13/Refacto/releases),
or you can build your own:

```sh
npm run build
```

The output is placed in `build`.

## Deploying

You will need to have NodeJS 18 or newer installed in the deployment
environment.

```sh
cd build
npm install --omit=dev
./index.js
```

By default:

- no authentication providers are available
  (you will need to add at least one to use the service);
- an in-memory database is used
  (all data will be lost when the process ends);
- blank secrets are used for encryption and password hashing
  (you can use `./scripts/random-secrets.mjs` to generate a set of
  secure random secrets for a deployment);
- Giphy integration is not enabled;
- haveibeenpwned integration _is_ enabled;
- the server listens on port `5000`.

See [SERVICES.md](docs/SERVICES.md) and
[SECURITY.md](docs/SECURITY.md) for details.

The full list of recognised configuration options (and their default
values) can be found in
[config/default.json](./backend/src/config/default.json)
(nested properties are joined and written in `UPPER_SNAKE_CASE`).

Typical values to configure are:

```sh
PORT=5000 \
SSO_GOOGLE_CLIENT_ID="<your-google-client-id>" \
SSO_GITHUB_CLIENT_ID="<your-github-client-id>" \
SSO_GITHUB_CLIENT_SECRET="<your-github-client-secret>" \
SSO_GITLAB_CLIENT_ID="<your-gitlab-client-id>" \
DB_URL="mongodb://localhost:27017/refacto" \
GIPHY_API_KEY="<your-giphy-api-key>" \
TRUST_PROXY="false" \
PASSWORD_WORK_FACTOR=10 \
PASSWORD_SECRET_PEPPER="<value-from-random-secrets.mjs>" \
ENCRYPTION_SECRET_KEY="<value-from-random-secrets.mjs>" \
TOKEN_SECRET_PASSPHRASE="<value-from-random-secrets.mjs>" \
./index.js
```

## Services

See the [services documentation](docs/SERVICES.md) for details on
setting up a database and integrating with authentication providers.

## Extra security

See the [security documentation](docs/SECURITY.md) for details on
configuring additional security for deployments.
