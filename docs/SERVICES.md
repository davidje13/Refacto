# Refacto service integrations

## Databases

By default, Refacto will use an in-memory database. This means it
cannot be load-balanced, and all data will be erased if the server is
restarted or an update is deployed. To persist data and allow
load-balancing, configure a real database:

### MongoDB

You can specify the database connection string as:

```bash
DB_URL=mongodb://localhost:27017/refacto npm start
```

The URL can also contain options, such as:

```bash
DB_URL=mongodb://localhost:27017/refacto?ssl=true npm start
```

#### Installation

On macOS, MongoDB can be installed with:

```bash
brew install mongodb
brew services start mongodb
```

On Ubuntu, it can be installed with:

```bash
apt install mongodb
```

The configuration file will be created at `/etc/mongod.conf`.

*Note: MongoDB's default security model is enough for local
development, but you should lock it down further in deployments. See
the [security documentation](./SECURITY.md) for details.*

## Authentication providers

### Google sign in

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

You can now invoke the application with the `SSO_GOOGLE_CLIENT_ID`
environment variable set. This applies to both local testing and
deployments. For example:

```bash
SSO_GOOGLE_CLIENT_ID=something.apps.googleusercontent.com npm start
```

### GitHub sign in

You will need a GitHub client ID:

1. Go to <https://github.com/settings/applications/new>
2. Set the "Homepage URL" to match your deployment. e.g. for local
   testing, use `http://localhost:5000`
3. Set the "Authorization callback URL" to the same value, with
   `/sso/github` appended to the end.
4. Record the client ID and client secret.

You can now invoke the application with the `SSO_GITHUB_CLIENT_ID` and
`SSO_GITHUB_CLIENT_SECRET` environment variables set. This applies to
both local testing and deployments. For example:

```bash
SSO_GITHUB_CLIENT_ID=idhere SSO_GITHUB_CLIENT_SECRET=secrethere npm start
```
