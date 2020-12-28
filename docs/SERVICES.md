# Refacto service integrations

## Databases

By default, Refacto will use an in-memory database. This means it
cannot be load-balanced, and all data will be erased if the server is
restarted or an update is deployed. To persist data and allow
load-balancing, configure a real database:

### MongoDB

You can specify the database connection string as:

```bash
DB_URL=mongodb://localhost:27017/refacto ./index.js
```

The URL can also contain options, such as:

```bash
DB_URL=mongodb://localhost:27017/refacto?ssl=true ./index.js
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

The configuration file will be created at `/usr/local/etc/mongod.conf`
on macOS and `/etc/mongod.conf` on Ubuntu.

*Note: MongoDB's default security model is enough for local
development, but you should lock it down further in deployments. See
the [security documentation](./SECURITY.md) for details.*

### Redis

Redis is also supported for persisting data, but is experimental and
not recommended for production deployments.

```bash
DB_URL=redis://localhost:6379/0 ./index.js
```

### PostgreSQL

PostgreSQL is also supported for persisting data, but is not optimised
for this type of data. For small deployments, it may be easier to
securely configure PostgreSQL than MongoDB.

You must create a database for Refacto to use. The schema will be
auto-generated when the app starts.

```bash
DB_URL=postgresql://localhost:5432/refacto ./index.js
```

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
SSO_GOOGLE_CLIENT_ID=something.apps.googleusercontent.com ./index.js
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
SSO_GITHUB_CLIENT_ID=idhere SSO_GITHUB_CLIENT_SECRET=secrethere ./index.js
```

### GitLab sign in

You will need a GitLab client ID:

1. Go to <https://gitlab.com/profile/applications>
2. Set the "Redirect URI" to match your deployment with
   `/sso/gitlab` appended to the end. e.g. for local
   testing, this could be `http://localhost:5000/sso/gitlab`
3. Untick the "confidential" option. You do not need to enable
   any scopes.
4. Record the application ID (you will not need the secret).

You can now invoke the application with the `SSO_GITLAB_CLIENT_ID`
environment variable set. This applies to both local testing and
deployments. For example:

```bash
SSO_GITLAB_CLIENT_ID=idhere ./index.js
```

To use a self-hosted GitLab deployment, you will also need to set
the auth and token info URLs:

```bash
SSO_GITLAB_AUTH_URL=https://gitlab.example.com/oauth/authorize \
SSO_GITLAB_TOKEN_INFO_URL=https://gitlab.example.com/oauth/token/info \
SSO_GITLAB_CLIENT_ID=idhere \
./index.js
```

## Other Integrations

### Giphy

You will need a Giphy API key:

1. Go to <https://developers.giphy.com/dashboard/?create=true>
2. Log in and provide an application name and description
3. Record the API key.

You can now invoke the application with the `GIPHY_API_KEY` environment
variable set. This applies to both local testing and deployments. For example:

```bash
GIPHY_API_KEY=keyhere ./index.js
```

### haveibeenpwned Password Database

The [haveibeenpwned password database](https://haveibeenpwned.com/Passwords)
is automatically used for checking user-provided passwords (k-Anonymity
ensures no passwords are leaked to the external service).

No configuration is required.
