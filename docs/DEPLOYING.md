# Deploying Refacto

At its simplest, you can build and deploy the core of Refacto with
these commands:

```bash
npm run build
```

The output will be placed in `build`. Specify the `PORT` environment
variable when running (defaults to 5000):

```bash
cd build
npm install --production
PORT=8080 node index.js
```

You will need to have NodeJS 14 or newer installed.

You can build on this to configure a database and authentication
providers. Some examples are given below;

## Preparation

You will need at least one authentication provider.
See [SERVICES.md](./SERVICES.md) for details.

For a secure deployment, you will also need a collection of secrets:

```bash
node scripts/random-secrets.js
```

## Docker Compose

The docker compose setup will automatically link a Mongo database
for persistence, but you will still need to provide authentication
providers for login. It does not include full security or
robustness.

```bash
npm run build
docker-compose -f deployment/docker-compose.yml build
```

To run, fill in the relevant variables and run:

```bash
PASSWORD_WORK_FACTOR=10 \
PASSWORD_SECRET_PEPPER= \
ENCRYPTION_SECRET_KEY= \
TOKEN_SECRET_PASSPHRASE= \
SSO_GOOGLE_CLIENT_ID= \
SSO_GITHUB_CLIENT_ID= \
SSO_GITHUB_CLIENT_SECRET= \
SSO_GITLAB_CLIENT_ID= \
GIPHY_API_KEY= \
docker-compose -f deployment/docker-compose.yml up
```

You can clear the database if needed by terminating the instances and
deleting the data volume:

```bash
docker-compose -f deployment/docker-compose.yml down
docker rm $(docker ps -a -f status=exited -q) || true
docker volume rm refacto-data
```
