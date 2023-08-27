# Deploying Refacto

## Building

You can find pre-built releases at
<https://github.com/davidje13/Refacto/releases>, or you can build
your own:

```bash
npm run build
```

The output is placed in `build`.

## Running

You will need to have NodeJS 18 or newer installed in the deployment
environment.

```bash
cd build
npm install --production
./index.js
```

By default:

- no authentication providers are available
  (you will need to add at least one to use the service);
- an in-memory database is used
  (all data will be lost when the process ends);
- blank secrets are used for encryption and password hashing
  (you can use `./scripts/random-secrets.js` to generate a set of
  secure random secrets for a deployment);
- Giphy integration is not enabled;
- haveibeenpwned integration _is_ enabled;
- the server listens on port `5000`.

See [SERVICES.md](./SERVICES.md) and
[SECURITY.md](./SECURITY.md) for details.

The full list of recognised configuration options (and their default
values) can be found in
[config/default.json](../src/backend/src/config/default.json)
(nested properties are joined and written in `UPPER_SNAKE_CASE`).

Typical values to configure are:

```bash
PORT=5000 \
SSO_GOOGLE_CLIENT_ID="<your-google-client-id>" \
SSO_GITHUB_CLIENT_ID="<your-github-client-id>" \
SSO_GITHUB_CLIENT_SECRET="<your-github-client-secret>" \
SSO_GITLAB_CLIENT_ID="<your-gitlab-client-id>" \
DB_URL="mongodb://localhost:27017/refacto" \
GIPHY_API_KEY="<your-giphy-api-key>" \
TRUST_PROXY="false" \
PASSWORD_WORK_FACTOR=10 \
PASSWORD_SECRET_PEPPER="<value-from-random-secrets.js>" \
ENCRYPTION_SECRET_KEY="<value-from-random-secrets.js>" \
TOKEN_SECRET_PASSPHRASE="<value-from-random-secrets.js>" \
./index.js
```
