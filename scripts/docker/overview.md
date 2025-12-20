# Refacto

Refacto makes it easy to run team retros with remote team members.

![Refacto](https://raw.githubusercontent.com/davidje13/Refacto/refs/heads/main/docs/screenshot.png)

See the official public deployment at <https://retro.davidje13.com/> and the source code on
[GitHub](https://github.com/davidje13/Refacto) and [GitLab](https://gitlab.com/davidje13/refacto).

# Quickstart

To run a simple instance locally with no authentication and no persistence:

```sh
docker run -d -e INSECURE_SHARED_ACCOUNT_ENABLED=true -p 5000:5000 refacto/refacto
```

You can access the tool at <http://localhost:5000/>.

Note that by default, Docker binds ports to all addresses (`0.0.0.0`), meaning your application will
also be available over the local network at your IP (unless blocked by a firewall).

# Customising

For a real deployment, there are various things you should customise:

## Adding persistence

You will need to run a separate database, for example with docker:

```sh
docker run -d -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
```

Then add this to your Refacto command (before `refacto/refacto`):

```sh
-e DB_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres"
```

You can also use other database services, such as MongoDB
([instructions](https://github.com/davidje13/Refacto/blob/main/docs/SERVICES.md#databases)).

## Adding an authentication provider

You can set up one or more authentication providers for your deployment domain
([instructions](https://github.com/davidje13/Refacto/blob/main/docs/SERVICES.md#authentication-providers))
then configure Refacto with:

```sh
-e SSO_GOOGLE_CLIENT_ID="<your-google-client-id>" \
-e SSO_GITHUB_CLIENT_ID="<your-github-client-id>" \
-e SSO_GITHUB_CLIENT_SECRET="<your-github-client-secret>" \
-e SSO_GITLAB_CLIENT_ID="<your-gitlab-client-id>" \
```

You will also need to _remove_ `INSECURE_SHARED_ACCOUNT_ENABLED` from your command (and Refacto will
refuse to start if it is still set).

Note that you do not need to be deploying to the public internet to use these services; you can
configure them with an internal domain or with localhost, as long as it matches the URL your browser
will access.

## Giphy integration

If you want to enable Giphy images,
[set up an account](https://github.com/davidje13/Refacto/blob/main/docs/SERVICES.md#giphy)
then configure Refacto with:

```sh
-e GIPHY_API_KEY="<your-giphy-api-key>" \
```

## Trusted proxy

If you are deploying behind a trusted reverse proxy, set `-e TRUST_PROXY=true`

```sh
-e TRUST_PROXY=true
```

## Security

To enable additional security, set the following options to random secrets.
These values must be preserved between runs:

```sh
-e PASSWORD_SECRET_PEPPER="<any-random-text>" \
-e ENCRYPTION_SECRET_KEY="<64-random-hex-characters>" \
-e TOKEN_SECRET_PASSPHRASE="<any-random-text>" \
```

## Additional Options

See the [services](https://github.com/davidje13/Refacto/blob/main/docs/SERVICES.md) and
[security](https://github.com/davidje13/Refacto/blob/main/docs/SECURITY.md) documentation for more
options which can be set.

## Load Balancing

If you are deploying Refacto on a service which offers automatic scaling, it is easiest to
configure it to only run a single instance. Even a single tiny instance is more than enough
capacity for most uses. If you _need_ to scale up to multiple instances, you must configure your
load balancer to direct WebSocket requests to `/api/retros/<id>` to _consistent_ servers. Failing
to do this can result in visitors accessing the same retro not seeing each other's updates unless
they refresh the page.

An example NGINX configuration which achieves this:

```nginx
upstream refacto_backend {
  # (list of servers here)
}

upstream refacto_backend_ws {
  # this is the important line to ensure all visitors
  # to the same retro reach the same server:
  hash $request_uri consistent;

  # (list of servers here)
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
