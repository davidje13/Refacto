# Refacto

A complete from-scratch re-write of
[Postfacto](https://github.com/pivotal/postfacto), with a focus on
simplified code, development, and deployment.

![Refacto](docs/screenshot.png)

## Running locally

Requires [Node.js](https://nodejs.org/en/).

```bash
npm start
```

The site will be available at <http://localhost:5000/>, using a mock
Google authentication server and an in-memory database.

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for full guidance on local
development.

## Building and deploying

```bash
npm run build
```

The output will be placed in `build`. Specify the `PORT` environment
variable when running (defaults to 5000):

```bash
cd build
npm install --production
PORT=8080 ./index.js
```

See the [deployment documentation](docs/DEPLOYING.md) for more
details and out-of-the-box examples.

*Note: by default, Refacto will use an in-memory database and will not
offer any login capabilities. See the sections below for details on
integrations and security considerations.*

## Services

See the [services documentation](docs/SERVICES.md) for details on
setting up a database and integrating with authentication providers.

## Extra security

See the [security documentation](docs/SECURITY.md) for details on
configuring additional security for deployments.
