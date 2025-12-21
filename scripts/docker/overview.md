# Refacto

Refacto makes it easy to run team retros with remote team members. See the
official public deployment at <https://retro.davidje13.com/> and the source code
on [GitHub](https://github.com/davidje13/Refacto) and
[GitLab](https://gitlab.com/davidje13/refacto).

![Refacto](https://raw.githubusercontent.com/davidje13/Refacto/refs/heads/main/docs/screenshot.png)

# Quickstart

To run a simple instance locally with no authentication and no persistence:

```sh
docker run -d -e INSECURE_SHARED_ACCOUNT_ENABLED=true -p 5000:5000 refacto/refacto
```

You can access the tool at <http://localhost:5000/>.

Note that by default, Docker binds ports to all addresses (`0.0.0.0`), meaning
your application will also be available over the local network at your IP
(unless blocked by a firewall).

# Provisioning

Refacto does not require much CPU or RAM allocated to run smoothly. You should
be able to provision the minimum available CPU on your platform of choice, and
at least 0.5GB RAM (provision 1GB if you expect very heavy usage). One area
which can be improved by allocating more CPU is the password login: this will be
noticeably faster with more CPU resource available.

# Customising

For a real deployment, there are various things you should customise:

## Adding persistence

You will need to run a separate database and a network connection, for example
with docker:

```sh
docker network create refactonet
docker run -d \
  --name refactodb \
  -e POSTGRES_DB=refacto \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_PASSWORD=mysecretpassword \
  --network refactonet \
  postgres
```

Wait for the postgres instance to boot, then run Refacto with:

```sh
docker run -d \
  -e INSECURE_SHARED_ACCOUNT_ENABLED=true \
  -e DB_URL="postgresql://myuser:mysecretpassword@refactodb:5432/refacto" \
  --network refactonet \
  -p 5000:5000 \
  refacto/refacto
```

You can also use other database services, such as MongoDB
([instructions](https://github.com/davidje13/Refacto/blob/main/docs/SERVICES.md#databases)).

## Adding an authentication provider

You can set up one or more authentication providers for your deployment domain
([instructions](https://github.com/davidje13/Refacto/blob/main/docs/SERVICES.md#authentication-providers))
then update your Refacto launch command with:

```sh
-e SSO_GOOGLE_CLIENT_ID="<your-google-client-id>" \
-e SSO_GITHUB_CLIENT_ID="<your-github-client-id>" \
-e SSO_GITHUB_CLIENT_SECRET="<your-github-client-secret>" \
-e SSO_GITLAB_CLIENT_ID="<your-gitlab-client-id>" \
```

You will also need to _remove_ `INSECURE_SHARED_ACCOUNT_ENABLED` from your
command (and Refacto will refuse to start if it is still set).

Note that you do not need to be deploying to the public internet to use these
services; you can configure them with an internal domain or with localhost, as
long as it matches the URL your browser will access.

## Giphy integration

If you want to enable Giphy images,
[set up an account](https://github.com/davidje13/Refacto/blob/main/docs/SERVICES.md#giphy)
then update your Refacto launch command with:

```sh
-e GIPHY_API_KEY="<your-giphy-api-key>" \
```

## Trusted proxy

If you are deploying behind a trusted reverse proxy, set `-e TRUST_PROXY=true`

```sh
-e TRUST_PROXY=true
```

## Load Balancing

If you are deploying Refacto on a service which offers automatic scaling, it is
easiest to configure it to only run a single instance (ensure the maximum
instance count is set to 1). Even a single tiny instance is more than enough
capacity for most uses. If you _need_ to scale out to multiple instances, you
must configure your load balancer to direct WebSocket requests to
`/api/retros/<id>` to _consistent_ servers. Failing to do this can result in
visitors accessing the same retro not seeing each other's updates unless they
refresh the page.

See an
[example of how to correctly load balance Refacto using NGINX](https://github.com/davidje13/Refacto/blob/main/docs/SERVICES.md#load-balancing).

## Security

To enable additional security (specifically to protect data against attackers
even if they gain access to the database), set the following options to random
secrets:

```sh
-e PASSWORD_SECRET_PEPPER="<any-random-text>" \
-e ENCRYPTION_SECRET_KEY="<64-random-hex-characters>" \
-e TOKEN_SECRET_PASSPHRASE="<any-random-text>" \
```

These values must be preserved between runs.

## Additional Options

See the
[services](https://github.com/davidje13/Refacto/blob/main/docs/SERVICES.md) and
[security](https://github.com/davidje13/Refacto/blob/main/docs/SECURITY.md)
documentation for more options which can be set.
