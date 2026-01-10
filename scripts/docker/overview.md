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

Ensure auto-scaling is disabled (in most services this means setting the maximum
instance count to 1). Even a single tiny instance is more than enough capacity
for most uses, and naïve load balancing will not work with Refacto. See
[Load Balancing in the deploying documentation](https://github.com/davidje13/Refacto/blob/main/docs/DEPLOYING.md#load-balancing)
for details and an example of how to set up load balancing correctly if needed.

# Customising

For a real deployment, there are various things you should customise:

## Adding persistence

By default, this Docker image uses a SQLite database persisted to an anonymous
volume mounted at `/data`. You can re-use this volume in subsequent deployments
to retain the data. The easiest way to manage this is to mount a named volume by
adding the following to the `docker run` command:

```sh
--mount type=volume,src=my-refacto-data,dst=/data
```

For a more robust database (e.g. to support load balancing with simultaneous
access), you will need to run a separate database and a network connection. For
example with docker:

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

As a convenience, you can easily generate randomised secrets by running:

```sh
docker run --rm refacto/refacto random-secrets
```

## Additional Options

See the
[deploying](https://github.com/davidje13/Refacto/blob/main/docs/DEPLOYING.md)
documentation for more details on how to self-host Refacto, and the
[services](https://github.com/davidje13/Refacto/blob/main/docs/SERVICES.md) and
[security](https://github.com/davidje13/Refacto/blob/main/docs/SECURITY.md)
documentation for more options which can be set.
