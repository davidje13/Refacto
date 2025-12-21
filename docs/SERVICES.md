# Refacto service integrations

## Databases

By default, Refacto will use an in-memory database. This means it cannot be
load-balanced, and all data will be erased if the server is restarted or an
update is deployed. To persist data and allow load-balancing, configure a real
database:

### MongoDB

You can specify the database connection string as:

```sh
DB_URL="mongodb://localhost:27017/refacto" ./index.js
```

The URL can also contain options, such as:

```sh
DB_URL="mongodb://localhost:27017/refacto?ssl=true" ./index.js
```

#### Installation

On macOS, MongoDB can be installed with:

```sh
brew install mongodb
brew services start mongodb
```

On Ubuntu, it can be installed with:

```sh
apt install mongodb
```

The configuration file will be created at `/usr/local/etc/mongod.conf` on macOS
and `/etc/mongod.conf` on Ubuntu.

_Note: MongoDB's default security model is enough for local development, but you
should lock it down further in deployments. See the
[security documentation](./SECURITY.md) for details._

### Redis

Redis is also supported for persisting data, but is experimental and not
recommended for production deployments.

```sh
DB_URL="redis://localhost:6379/0" ./index.js
```

### PostgreSQL

PostgreSQL is also supported for persisting data, but is not optimised for this
type of data. For small deployments, it may be easier to securely configure
PostgreSQL than MongoDB.

You must create a database for Refacto to use. The schema will be auto-generated
when the app starts.

```sh
DB_URL="postgresql://localhost:5432/refacto" ./index.js
```

## Authentication providers

### Google sign in

You will need a Google client ID:

1. Go to <https://console.developers.google.com/apis>
2. Create a new project (if necessary)
3. In the "Credentials" screen, find the auto-generated OAuth client entry (if
   it was not created automatically, create one manually with "Create
   credentials" &rarr; "OAuth client ID")
4. Record the client ID (you will not need the client secret)
5. Update the authorised JavaScript origins to match your deployment. e.g. for
   local testing, add `http://localhost:5000`
6. Update the authorised redirect URIs to the same value, with `/sso/google`
   appended to the end.
7. You may want to change the "Support email" listed under "OAuth consent
   screen", as this will be visible to users of your deployed app.

You can now invoke the application with the `SSO_GOOGLE_CLIENT_ID` environment
variable set. This applies to both local testing and deployments. For example:

```sh
SSO_GOOGLE_CLIENT_ID="something.apps.googleusercontent.com" ./index.js
```

### GitHub sign in

You will need a GitHub client ID:

1. Go to <https://github.com/settings/applications/new>
2. Set the "Homepage URL" to match your deployment. e.g. for local testing, use
   `http://localhost:5000`
3. Set the "Authorization callback URL" to the same value, with `/sso/github`
   appended to the end.
4. Record the client ID and client secret.

You can now invoke the application with the `SSO_GITHUB_CLIENT_ID` and
`SSO_GITHUB_CLIENT_SECRET` environment variables set. This applies to both local
testing and deployments. For example:

```sh
SSO_GITHUB_CLIENT_ID="idhere" SSO_GITHUB_CLIENT_SECRET="secrethere" ./index.js
```

### GitLab sign in

You will need a GitLab client ID:

1. Go to <https://gitlab.com/-/user_settings/applications>
2. Set the "Redirect URI" to match your deployment with `/sso/gitlab` appended
   to the end. e.g. for local testing, this could be
   `http://localhost:5000/sso/gitlab`
3. Untick the "confidential" option and select the "email" scope (this is the
   closest we can get to no scopes)
4. Record the application ID (you will not need the secret).

You can now invoke the application with the `SSO_GITLAB_CLIENT_ID` environment
variable set. This applies to both local testing and deployments. For example:

```sh
SSO_GITLAB_CLIENT_ID="idhere" ./index.js
```

To use a self-hosted GitLab deployment, you will also need to set the auth and
token info URLs:

```sh
SSO_GITLAB_AUTH_URL="https://gitlab.example.com/oauth/authorize" \
SSO_GITLAB_ACCESS_TOKEN_URL="https://gitlab.example.com/oauth/token" \
SSO_GITLAB_TOKEN_INFO_URL="https://gitlab.example.com/oauth/token/info" \
SSO_GITLAB_CLIENT_ID="idhere" \
./index.js
```

### Public access

If you are running Refacto in a private network where all users are trusted, you
can set up Refacto to allow all users access to a single account. This is
simpler than setting up an authentication provider, but will allow everybody
access to the same account.

```sh
INSECURE_SHARED_ACCOUNT_ENABLED=true ./index.js
```

By default this will use `/api/open-login` as the login URL. If you want to use
a different URL, you can configure it:

```sh
INSECURE_SHARED_ACCOUNT_ENABLED=true \
INSECURE_SHARED_ACCOUNT_AUTH_URL="/custom-path" \
./index.js
```

You may want to provide some additional security by protecting this URL in your
proxy. For example, to enable Basic auth using NGINX:

```
location /api/open-login {
    auth_basic           "Admin";
    auth_basic_user_file /etc/apache2/.htpasswd;
}
```

Or to enable access only from a specific IP:

```
location /api/open-login {
    allow 1.2.3.4/32;
    deny all;
}
```

When using the shared account, any user who can log in will see the same list of
retros (i.e. all of the retros created by any user), and can access them without
a password. If you want to prevent this, disable the "My Retros" list:

```sh
INSECURE_SHARED_ACCOUNT_ENABLED=true \
PERMIT_MY_RETROS=false \
./index.js
```

## Reverse Proxy

To support HTTPS and/or load balancing, you will need to use a reverse proxy
such as Apache HTTPD or NGINX. Deploying to a platform-as-a-service will usually
handle HTTPS automatically, but note that default load balancing strategies will
not work with Refacto, because it requires users accessing the same retro to be
connected to the same server. If your deployment platform supports automatic
scaling, make sure you set the maximum number of instances to 1.

When deploying behind a proxy, you should set `TRUST_PROXY=true`:

```sh
TRUST_PROXY=true ./index.js
```

(do not set this to `true` unless behind a trusted proxy which sets the
`X-Forwarded-*` headers)

### Load Balancing

Most deployments will not require load balancing: even a single tiny instance is
able to support several concurrent retro with many participants in each, and
larger deployments can easily be handled by scaling up the hardware. If you
_need_ to scale out to multiple instances, you must configure your load balancer
to direct WebSocket requests to `/api/retros/<id>` to _consistent_ servers.
Failing to do this can result in visitors accessing the same retro not seeing
each other's updates unless they refresh the page.

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

## Other Integrations

### Giphy

You will need a Giphy API key:

1. Go to <https://developers.giphy.com/dashboard/?create=true>
2. Log in and provide an application name and description
3. Record the API key.

You can now invoke the application with the `GIPHY_API_KEY` environment variable
set. This applies to both local testing and deployments. For example:

```sh
GIPHY_API_KEY="keyhere" ./index.js
```

### haveibeenpwned Password Database

The [haveibeenpwned password database](https://haveibeenpwned.com/Passwords) is
automatically used for checking user-provided passwords (k-Anonymity ensures no
passwords are leaked to the external service).

No configuration is required.

If you wish to _disable_ this integration, you can specify a blank URL:

```sh
PASSWORD_CHECK_BASE_URL="" ./index.js
```

### Logs

Refacto writes logs to `stderr` by default, which will typically be picked up by
the service runner and written to the system logs (e.g. syslog or journal).

You can configure it to write to a file instead:

```sh
LOG_FILE="/path/to/file.log" ./index.js
```

This will direct all structured logs to the file (some unstructured startup and
shutdown logs will still be written to `stderr`). Each log entry is a single
line containing a JSON-encoded object of the form:

```json
{ "time": 1757433145000, "event": "something", "other-fields": "" }
{ "time": 1757433145000, "error": "type", "name": "MyError", "message": "oops", "stack": "this.js:88\nthat.js:100" }
```

When analytics are enabled, client-related log entries will also contain browser
and OS versions (see the [security documentation](./SECURITY.md)).

#### Log rotation

You can use an external service such as `logrotate` to configure logrotation.
After rotating the logs, send a `SIGHUP` to Refacto to make it reopen the log
file (else it will continue to write logs to the renamed file).

```sh
kill -SIGHUP <refacto-pid-here>
```

For example if started as a service via systemd, the following `logrotate`
config will work (adjust paths, user, group, frequency, etc.):

```
/path/to/refacto/logfile.log {
  weekly
  rotate 52
  notifempty
  missingok
  create 640 refacto-user adm

  compress
  delaycompress

  postrotate
    kill -SIGHUP "$(systemctl show --property MainPID --value refacto.service)"
  endscript
}
```
