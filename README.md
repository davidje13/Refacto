# Refacto

A complete from-scratch re-write of
[Postfacto](https://github.com/pivotal/postfacto), with a focus on
simplified code, development, and deployment.

## Running locally

Requires [Node.js](https://nodejs.org/en/).

```bash
npm install
npm start
```

The site will be available at <http://localhost:5000/>.

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
PORT=8080 npm start
```
