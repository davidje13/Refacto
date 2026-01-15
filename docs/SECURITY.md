# Refacto security considerations

## HTTPS

This application runs a HTTP server which should be deployed behind a reverse
proxy (such as Apache HTTPD or NGINX) to enable HTTPS. The proxy should also be
configured to block or redirect HTTP traffic.

Deploying to a platform-as-a-service will handle this automatically.

When deploying behind a proxy, you should set `TRUST_PROXY=true`:

```sh
TRUST_PROXY=true ./index.js
```

(do not set this to `true` unless behind a trusted proxy which sets the
`X-Forwarded-*` headers)

See [Reverse Proxy in the services documentation](./SERVICES.md#reverse-proxy)
for more details.

## Passwords

All passwords are protected using the bcrypt hashing algorithm with a work
factor, individual salts, and a "brute-force salt".

### Work factor

If you have a powerful webserver, you can increase the hash work factor:

```sh
PASSWORD_WORK_FACTOR=12 ./index.js
```

This value can be changed with each deployment (and should slowly increase over
time as your deployment hardware becomes more powerful). Passwords which are
weaker than the current value will automatically be re-hashed during successful
logins. Lowering this value will only affect new passwords; existing passwords
will never be rehashed to a weaker hash.

Increasing this value by 1 will double the time taken to perform a hash
(assuming the same hardware). The default value (as of 2019) is 10. Due to the
use of a brute-force salt, this has an effective average value of 12 for a
successful login and 13 for an unsuccessful login.

### Secret pepper

For extra security against database breaches, you can also specify a secret
pepper value. This protects passwords in the event of a database breach if the
webserver itself is not compromised. The pepper value must be the same for all
instances of the webserver, and must remain constant with deployments of new
versions of the app. The best place to store this value is in a deployment
pipeline configuration, or a configuration server.

```sh
PASSWORD_SECRET_PEPPER="asecretwhichmustnotbeknown" ./index.js
```

Currently it is not possible to cycle this secret value, as passwords can only
be re-hashed during a successful login.

**If this value ever changes, all passwords will become invalid. If you specify
a secret pepper, ensure it will never be lost!**

## NodeJS runtime flags

When launched with `./index.js`, node hardening flags are applied automatically.
If you need to customise the NodeJS flags, you should be sure to specify these
as well:

```sh
node --force-node-api-uncaught-exceptions-policy --no-addons --disallow-code-generation-from-strings --disable-proto delete index.js
```

Note that these must be included _before_ the `index.js` argument.

If you do not need to specify custom flags, it is recommended to stick with
using `./index.js` to launch the application instead of `node index.js`, as the
former will automatically get new security flags as they are added.

## Data encryption

All retro item data is encrypted in the database using aes-256-cbc, regardless
of database choice. By default, a secret key of all zeros is used, providing no
real protection. To get the benefits of data encryption, supply a secret key on
startup.

```sh
ENCRYPTION_SECRET_KEY="0000000000000000000000000000000000000000000000000000000000000000" ./index.js
```

The secret key should be 32 random bytes (256 bits) encoded in base16 (hex). As
a convenience, you can generate suggested random secrets with:

```sh
./index.js random-secrets
# or
docker run --rm refacto/refacto random-secrets
```

Example output:

```
PASSWORD_SECRET_PEPPER=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV
ENCRYPTION_SECRET_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
TOKEN_SECRET_PASSPHRASE=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV
```

Non-item data (such as the retro name, settings, and current state) is not
encrypted.

Currently it is not possible to cycle this secret value.

**If this value ever changes, all retro data will be lost. If you specify a
secret key, ensure it will never be lost!**

## Signed tokens

All user and retro tokens are signed using the RSA256 algorithm. This requires a
private key for signing, and a public key for verifying. The application will
automatically generate these keys and store them in the database (a global pair
for user tokens and a per-retro pair for retro tokens).

### Private key passphrase

For extra security against database breaches, you can also specify a private key
passphrase. This encrypts the private key, protecting your application from
malicious tokens in the event of a database breach if the webserver itself is
not compromised. The passphrase must be the same for all instances of the
webserver, and must remain constant with deployments of new versions of the app.
The best place to store this value is in a deployment pipeline configuration, or
a configuration server.

```sh
TOKEN_SECRET_PASSPHRASE="asecretwhichmustnotbeknown" ./index.js
```

**If this value ever changes, you will need to regenerate all key pairs. This
will invalidate any active sessions, forcing all users to reauthenticate.**

## MongoDB

### User authentication (access control)

Refacto manages its own database, creating and modifying collections and indices
automatically. For this reason, it is best to configure mongo access with the
`readWrite` and `dbAdmin` roles within the database you want it to use.

These permissions are quite broad, but enabling user authentication is still
beneficial for a number of reasons:

- Without authentication, any user on the machine is able to connect to MongoDB
  and perform any operation (and if MongoDB is exposed on a network, any machine
  which can reach the server can connect and perform any operation);
- Admin-level commands such as managing users and clusters can be restricted;
- Access to other databases hosted in the same MongoDB instance can be
  restricted.

To set up user roles from scratch in a MongoDB deployment:

1.  Create an admin user: (this will be used to create the other users)

    - Pick a secure password for the admin user, and note it somewhere safe. For
      example:

      ```sh
      openssl rand -base64 30 | tr '/+' '_-'
      ```

    - Create the user:

      ```sh
      mongosh admin --eval 'db.createUser({user:"my-admin-user",pwd:passwordPrompt(),roles:["root"],mechanisms:["SCRAM-SHA-256"]})';
      ```

      Replace `my-admin-user` with the username you want to use.

      Note: if you want to specify the password programmatically rather than
      entering it manually, you can pipe the password to the `mongosh` command
      via `stdin`.

2.  Create a refacto user with access to the specific database you plan to use:

    ```sh
    mongosh my-refacto-db --authenticationDatabase=admin -u my-admin-user -p \
      --eval 'db.createUser({user:"my-refacto-user",pwd:passwordPrompt(),roles:[{"db":"my-refacto-db","role":"readWrite"},{"db":"my-refacto-db","role":"dbAdmin"}],mechanisms:["SCRAM-SHA-256"]})';
    ```

    Replace all occurrences of `my-refacto-db` with the database name you are
    using, and replace `my-refacto-user` with the username you want to use.

    Note: if you want to specify the passwords programmatically rather than
    entering them manually, you can pipe the passwords to the `mongosh` command
    via `stdin`, separated by newlines (admin password + newline + refacto user
    password).

3.  Enforce authorization:

    Check the location of your `mongod.conf` file
    ([typical locations](https://www.mongodb.com/docs/manual/reference/configuration-options/#configuration-file))
    and modify it to enable authorization:

    ```sh
    echo 'security.authorization: enabled' >> /etc/mongod.conf
    ```

    Restart MongoDB: (the exact command will depend on your system and how you
    installed it)

    ```sh
    sudo systemctl restart mongod
    ```

You can now connect as the `my-admin-user` user:

```sh
mongosh --authenticationDatabase admin -u my-admin-user -p
```

And configure Refacto to connect as the `my-refacto-user` user:

```sh
DB_URL="mongodb://my-refacto-user:<pass>@localhost:27017/my-refacto-db" ./index.js
```

<https://docs.mongodb.com/manual/tutorial/enable-authentication/>

### Encrypted communication

If the database is running on a separate server, you should enable encrypted
communication (to avoid eavesdropping) as well as client and server identity
checks (to avoid man-in-the-middle attacks). See the
[MongoDB documentation for guidance](https://www.mongodb.com/docs/manual/tutorial/configure-ssl/).

## Analytics / Diagnostics

By default, Refacto will log server and client errors, but will not record
events or any client details (platform / browser version).

Server-side errors are always logged.

You can enable more detailed logging when starting the server if desired:

```sh
ANALYTICS_EVENT_DETAIL="version" \
ANALYTICS_CLIENT_ERROR_DETAIL="version" \
./index.js
```

By default, the event detail is set to `none`, and client error detail is set to
`message`. The possible values for both options are:

- `version`: Record the event or error, the name of the platform, and the name
  and major version of the browser.

- `brand`: Record the event or error, and the name of the platform and browser
  (but do not include version information).

- `message`: Record the event or error (and a timestamp), but do not record any
  details about the platform or browser which is in use. Note that some error
  messages may identify the browser implicitly.

- `none`: Do not record this data at all.

None of these settings involve the use of cookies to track users. Only the
`User-Agent` header of requests is used.

Any users who set the `DNT` (Do Not Track) or `Sec-GPC` (Global Privacy Control)
header will not be included in logs (as if `ANALYTICS_EVENT_DETAIL` were limited
to `none` and `ANALYTICS_CLIENT_ERROR_DETAIL` were limited to `message` or
`none`). Removing these users from the logs goes beyond required privacy
controls (as the details recorded are not shared with third parties), but is
done to respect user preferences.
