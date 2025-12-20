# Refacto

A complete from-scratch re-write of
[Postfacto](https://github.com/vmware-archive/postfacto), with a focus on
simplified code, development, and deployment.

![Refacto](docs/screenshot.png)

## Running locally

Requires [Node.js 20 or above](https://nodejs.org/en/).

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

### With Docker

You can deploy using the [Docker Hub image](https://hub.docker.com/repository/docker/refacto/refacto/general):

```sh
docker run -d -e INSECURE_SHARED_ACCOUNT_ENABLED=true refacto/refacto
```

(see the image details for information on how to configure and secure docker deployments).

### Without Docker

You will need to have Node.js 20 or newer installed in the deployment
environment.

[Download and unpack a release](https://github.com/davidje13/Refacto/releases) (or
[build your own](#building-for-deployment)), then in the release directory run:

```sh
npm install --omit=dev
INSECURE_SHARED_ACCOUNT_ENABLED=true ./index.js
```

### Configuration

By default:

- no authentication providers are available (setting `INSECURE_SHARED_ACCOUNT_ENABLED`
  means everybody who can access the site will be able to see all retros);
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
[config/default.ts](./backend/src/config/default.ts)
(nested properties are joined and written in `UPPER_SNAKE_CASE`).

Typical values to configure are:

```sh
PORT=5000 \
LOG_FILE="</path/to/log/file.log>" \
SSO_GOOGLE_CLIENT_ID="<your-google-client-id>" \
SSO_GITHUB_CLIENT_ID="<your-github-client-id>" \
SSO_GITHUB_CLIENT_SECRET="<your-github-client-secret>" \
SSO_GITLAB_CLIENT_ID="<your-gitlab-client-id>" \
DB_URL="mongodb://localhost:27017/refacto" \
GIPHY_API_KEY="<your-giphy-api-key>" \
TRUST_PROXY="false" \
ANALYTICS_EVENT_DETAIL="<version/brand/message/none>" \
ANALYTICS_CLIENT_ERROR_DETAIL="<version/brand/message/none>" \
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
