# Deploying

Refacto has a public, free to use deployment at <https://retro.davidje13.com/>.
This is hosted on Amazon Web Services in the eu-west-2 (London) region.

If you want to host your own instance (e.g. for data sovereignty or to protect
access within a VPN), there are several options available:

## Deploying With Docker

You can deploy using the
[Docker Hub image](https://hub.docker.com/r/refacto/refacto):

```sh
docker run -d -e INSECURE_SHARED_ACCOUNT_ENABLED=true -p 5000:5000 refacto/refacto
```

or the [AWS ECR Public image](https://gallery.ecr.aws/refacto/refacto):

```sh
docker run -d -e INSECURE_SHARED_ACCOUNT_ENABLED=true -p 5000:5000 public.ecr.aws/refacto/refacto
```

(see the image details for information on how to configure and secure docker
deployments).

By default, the docker container will use a SQLite database which persists its
data in an anonymous volume mounted to `/data`. You can customise this to
persist data in a named volume (which will allow you to keep your data when
updating to a later version) by adding this to the `docker run` command:

```sh
--mount type=volume,src=my-refacto-data,dst=/data
```

Or see [SERVICES.md](docs/SERVICES.md) for details on using an external
database. Note that SQLite databases cannot be shared between multiple proceses
at once.

The [releases](https://github.com/davidje13/Refacto/releases) also contain
`Dockerfile`s if you wish to generate your own docker image, or you can
[build your own from source](#building-from-source).

## Deploying Without Docker

You will need to have Node.js 20 or newer installed in the deployment
environment. Refacto currently supports Node.js 20, 22, 24, and 25.

[Download and unpack a release](https://github.com/davidje13/Refacto/releases)
(or [build your own](#building-from-source)), then in the release directory run:

```sh
INSECURE_SHARED_ACCOUNT_ENABLED=true ./index.js
```

If you see an error along the lines of "unrecognised option `-S`", make sure you
have a recent version of `env` installed (e.g. `apk add coreutils-env`). If you
cannot install a newer `env`, you can launch the app using `node index.js`
instead (but note that if doing this, you will need to specify your own
[Node.js hardening flags](./SECURITY.md#nodejs-runtime-flags)).

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

Note that because Refacto uses WebSockets for live collaboration, you will need
to ensure your deployment is capable of holding open a large number of
simultaneous connections (at least one per expected concurrent user, plus some
extra for static asset and API requests). For small deployments this is not a
concern, as the defaults are usually ample.

Ensure auto-scaling is disabled (in most services this means setting the maximum
instance count to 1). Even a single tiny instance is more than enough capacity
for most uses, and naïve load balancing will not work with Refacto. See
[Load Balancing](#load-balancing) for details and an example of how to set up
load balancing correctly if needed.

## Configuration

By default:

- no authentication providers are available (setting
  `INSECURE_SHARED_ACCOUNT_ENABLED` means everybody who can access the site will
  be able to see all retros);
- with Docker, a SQLite database is used, storing data in an anonymous volume
  mounted to `/data`. Without Docker, an in-memory database is used (all data
  will be lost when the process ends);
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

## Health Check

If you want to configure a health check, you can make HTTP requests to the
`/api/health` endpoint. This will return `200 OK` during normal operation.

## Reverse Proxy

When deploying behind a proxy such as NGINX, Apache HTTPD, or a PaaS load
balancer, you should set `TRUST_PROXY=true`:

```sh
TRUST_PROXY=true ./index.js
```

(do not set this to `true` unless the only way for users to access the site is
via a trusted proxy which sets the `X-Forwarded-*` headers)

### Load Balancing

For efficiency reasons, Refacto needs all participants in a particular retro to
be connected to the same server, otherwise they will not see each other's
changes in real time. Using a CDN such as CloudFront or CloudFlare is fine, as
it will always proxy API requests and WebSockets to your server. However using a
standard load balancer with multiple instances of Refacto will not work, as
users accessing the same retro may end up on different backend instances.

Even a single tiny instance of Refacto is able to support several concurrent
retros with many participants in each, and larger deployments can easily be
handled by scaling up the hardware, so most deployments will not need multiple
instances. If you are hosting a very large number of simultaneous retros and
_need_ additional instances, you must configure your load balancer to direct
WebSocket requests to `/api/retros/<id>` to _consistent_ backend servers.

An example NGINX configuration which achieves this:

```nginx
upstream refacto_backend {
  # Regular load balancing for non-WebSocket requests

  # list of servers here, e.g.:
  server 10.0.0.1:5000;
  server 10.0.0.2:5000;
}

upstream refacto_backend_ws {
  # Consistent load balancing for WebSocket requests
  hash $request_uri consistent;

  # same list of servers again:
  server 10.0.0.1:5000;
  server 10.0.0.2:5000;
}

map $http_upgrade $connection_upgrade {
  default upgrade;
  '' close;
}

server {
  # (regular config here)

  location / {
    proxy_pass http://refacto_backend;
    proxy_http_version 1.1;
    proxy_redirect off;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Host $host:443;
    proxy_set_header Connection "";
  }

  location /api/retros {
    proxy_pass http://refacto_backend_ws;
    proxy_http_version 1.1;
    proxy_redirect off;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Host $host:443;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_request_buffering off;
    proxy_buffering off;
  }
}
```

See the
[NGINX upstream documentation](https://nginx.org/en/docs/http/ngx_http_upstream_module.html)
for more details.
