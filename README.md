# Refacto

A complete from-scratch re-write of
[Postfacto](https://github.com/pivotal/postfacto), with a focus on
simplified code, development, and deployment.

## Running locally

Requires [Node.js](https://nodejs.org/en/).

```bash
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

## Authentication providers

### Configuring Google sign in

You will need a Google client ID:

1. Go to <https://console.developers.google.com/apis>
2. Create a new project (if necessary)
3. In the "Credentials" screen, find the auto-generated OAuth client
   entry (if it was not created automatically, create one manually with
   "Create credentials" &rarr; "OAuth client ID")
4. Record the client ID (you will not need the client secret)
5. Update the authorised JavaScript origins to match your deployment.
   e.g. for local testing, add `http://localhost:5000`
6. Update the authorised redirect URIs to the same value, with
   `/sso/google` appended to the end.
7. You may want to change the "Support email" listed under
   "OAuth consent screen", as this will be visible to users of your
   deployed app.

You can now invoke the application with the `GOOGLE_CLIENT_ID`
environment variable set. This applies to both local testing and
deployments. For example:

```bash
GOOGLE_CLIENT_ID=something.apps.googleusercontent.com npm start
```

### Configuring GitHub sign in

You will need a GitHub client ID:

1. Go to <https://github.com/settings/applications/new>
2. Set the "Homepage URL" to match your deployment. e.g. for local
   testing, use `http://localhost:5000`
3. Set the "Authorization callback URL" to the same value, with
   `/sso/github` appended to the end.
4. Record the client ID and client secret.
```
You can now invoke the application with the `GITHUB_CLIENT_ID` and
`GITHUB_CLIENT_SECRET` environment variables set. This applies to both
local testing and deployments. For example:

```bash
GITHUB_CLIENT_ID=idhere GITHUB_CLIENT_SECRET=secrethere npm start
```

## Extra security

See the [security documentation](docs/SECURITY.md) for details on
configuring additional security for deployments.
