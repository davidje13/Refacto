# Deploying

Refacto has a public, free to use deployment at <https://retro.davidje13.com/>.

If you want to host your own instance (e.g. for data sovereignty or to protect
access within a VPN), there are several options available:

## Deploying With Docker

You can deploy using the
[Docker Hub image](https://hub.docker.com/r/refacto/refacto):

```sh
docker run -d -e INSECURE_SHARED_ACCOUNT_ENABLED=true -p 5000:5000 refacto/refacto
```

(see the image details for information on how to configure and secure docker
deployments).

The [releases](https://github.com/davidje13/Refacto/releases) also contain
`Dockerfile`s if you wish to generate your own docker image, or you can
[build your own from source](#building-from-source).

## Deploying Without Docker

You will need to have Node.js 20 or newer installed in the deployment
environment.

[Download and unpack a release](https://github.com/davidje13/Refacto/releases)
(or [build your own](#building-from-source)), then in the release directory run:

```sh
npm install --omit=dev
INSECURE_SHARED_ACCOUNT_ENABLED=true ./index.js
```

If you see an error along the lines of "unrecognised option `-S`", make sure you
have a recent version of `env` installed (e.g. `apk add coreutils-env`). If you
cannot install a newer `env`, you can launch the app using `node index.js`
instead (but note that if doing this, you will need to specify your own
[Node.js hardening](./SECURITY.md#nodejs-runtime-flags) flags).

## Building From Source

If you do not want to use a
[pre-built release](https://github.com/davidje13/Refacto/releases), you can
build your own:

```sh
npm run build
```

The output is placed in `build`.

If you want to generate your own docker image, run:

```sh
docker build ./build
```

## Provisioning

Refacto does not require much CPU or RAM allocated to run smoothly. You should
be able to provision the minimum available CPU on your platform of choice, and
at least 0.5GB RAM (provision 1GB if you expect very heavy usage). One area
which can be improved by allocating more CPU is the password login: this will be
noticeably faster with more CPU resource available (or you can
[enable more hashing rounds](./SECURITY.md#work-factor) to increase security).

Note that because Refacto uses Web Sockets for live collaboration, you will need
to ensure your deployment is capable of holding open a large number of
simultaneous connections (at least one per expected concurrent user, plus some
extra for static asset and API requests). For small deployments this is not a
concern, as the defaults are usually ample.

You should _not_ enable any auto-scaling provided by your platform. Where
possible, set the maximum number of instances to 1 (note that some platforms
enable auto-scaling by default). For efficiency reasons, Refacto needs all
participants in a particular retro to be connected to the same server, otherwise
they will not see each other's changes in real time. Most deployments will not
need more than a single small instance to run Refacto successfully, but if you
have a very high load and _need_ additional instances, see
[Load Balancing in the services documentation](./SERVICES.md#load-balancing) for
an example of how to correctly load balance using an NGINX reverse proxy.

## Health Check

If you want to configure a health check, you can make HTTP requests to the
`/api/health` endpoint. This will return `200 OK` during normal operation.

## Configuration

By default:

- no authentication providers are available (setting
  `INSECURE_SHARED_ACCOUNT_ENABLED` means everybody who can access the site will
  be able to see all retros);
- an in-memory database is used (all data will be lost when the process ends);
- blank secrets are used for encryption and password hashing (you can use
  `./index.js random-secrets` or
  `docker run --rm refacto/refacto random-secrets` to generate a set of secure
  random secrets for a deployment);
- Giphy integration is not enabled;
- haveibeenpwned integration _is_ enabled;
- the server listens on port `5000`.

See [SERVICES.md](docs/SERVICES.md) and [SECURITY.md](docs/SECURITY.md) for
details.

The full list of recognised configuration options (and their default values) can
be found in [config/default.ts](../backend/src/config/default.ts) (nested
properties are joined and written in `UPPER_SNAKE_CASE`).

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
PASSWORD_SECRET_PEPPER="<value-from-random-secrets>" \
ENCRYPTION_SECRET_KEY="<value-from-random-secrets>" \
TOKEN_SECRET_PASSPHRASE="<value-from-random-secrets>" \
./index.js
```
