# Refacto

Refacto makes it easy to run team retros with remote team members. You can use
the official public deployment at <https://retro.davidje13.com/>, or
[host your own instance](docs/DEPLOYING.md).

![Refacto](docs/screenshot.png)

## Running Locally

Requires [Node.js 20 or above](https://nodejs.org/en/).

```sh
npm start
```

The site will be available at <http://localhost:5000/>, using a mock Google
authentication server and an in-memory database.

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for full guidance on local
development.

## Self-Hosting

See the [deploying documentation](docs/DEPLOYING.md) for details on hosting your
own instance of Refacto.

## Services

See the [services documentation](docs/SERVICES.md) for details on setting up a
database and integrating with authentication providers.

## Extra Security

See the [security documentation](docs/SECURITY.md) for details on configuring
additional security for deployments.
