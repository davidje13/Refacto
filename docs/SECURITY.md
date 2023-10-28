# Refacto security considerations

## HTTPS

This application runs a HTTP server which should be deployed behind a
reverse proxy (such as Apache HTTPD or NGINX) to enable HTTPS. The
proxy should also be configured to block or redirect HTTP traffic.

Deploying to a platform-as-a-service will handle this automatically.

When deploying behind a proxy, you should set `TRUST_PROXY=true`:

```sh
TRUST_PROXY=true ./index.js
```

(do not set this to `true` unless behind a trusted proxy which sets
the `X-Forwarded-*` headers)

## Passwords

All passwords are protected using the bcrypt hashing algorithm with a
work factor, individual salts, and a "brute-force salt".

### Work factor

If you have a powerful webserver, you can increase the hash work
factor:

```sh
PASSWORD_WORK_FACTOR=12 ./index.js
```

This value can be changed with each deployment (and should slowly
increase over time as your deployment hardware becomes more powerful).
Passwords which are weaker than the current value will automatically be
re-hashed during successful logins. Lowering this value will only
affect new passwords; existing passwords will never be rehashed to a
weaker hash.

Increasing this value by 1 will double the time taken to perform a
hash (assuming the same hardware). The default value (as of 2019)
is 10. Due to the use of a brute-force salt, this has an effective
average value of 12 for a successful login and 13 for an unsuccessful
login.

### Secret pepper

For extra security against database breaches, you can also specify a
secret pepper value. This protects passwords in the event of a database
breach if the webserver itself is not compromised. The pepper value
must be the same for all instances of the webserver, and must remain
constant with deployments of new versions of the app. The best place to
store this value is in a deployment pipeline configuration, or a
configuration server.

```sh
PASSWORD_SECRET_PEPPER="asecretwhichmustnotbeknown" ./index.js
```

Currently it is not possible to cycle this secret value, as passwords
can only be re-hashed during a successful login.

**If this value ever changes, all passwords will become invalid.
If you specify a secret pepper, ensure it will never be lost!**

## NodeJS runtime flags

When launched with `./index.js`, node hardening flags are applied
automatically. If you need to customise the NodeJS flags, you should
be sure to specify these as well:

```
node --disable-proto delete index.js
```

Note that these must be included *before* the `index.js` argument.

If you do not need to specify custom flags, it is recommended to
stick with using `./index.js` to launch the application instead of
`node index.js`, as the former will automatically get new security
flags as they are added.

### Additional runtime flags

To enable an (experimental) NodeJS feature for limiting the source
files which can be loaded, you can set an environment variable:

```
NODE_OPTIONS='--experimental-policy=./policy.json'
```

(`policy.json` is provided in the same folder as `index.js` - if
that is not the current directory, change the path to match)

## Data encryption

All retro item data is encrypted in the database using aes-256-cbc,
regardless of database choice. By default, a secret key of all zeros
is used, providing no real protection. To get the benefits of data
encryption, supply a secret key on startup.

```sh
ENCRYPTION_SECRET_KEY="0000000000000000000000000000000000000000000000000000000000000000" ./index.js
```

The secret key should be 32 random bytes (256 bits) encoded in
base16 (hex). You can generate a random key with:

```sh
./scripts/random-secrets.mjs
```

Non-item data (such as the retro name, settings, and current state)
is not encrypted.

Currently it is not possible to cycle this secret value.

**If this value ever changes, all retro data will be lost.
If you specify a secret key, ensure it will never be lost!**

## Signed tokens

All user and retro tokens are signed using the RSA256 algorithm.
This requires a private key for signing, and a public key for
verifying. The application will automatically generate these keys and
store them in the database (a global pair for user tokens and a
per-retro pair for retro tokens).

### Private key passphrase

For extra security against database breaches, you can also specify a
private key passphrase. This encrypts the private key, protecting your
application from malicious tokens in the event of a database breach if
the webserver itself is not compromised. The passphrase must be the
same for all instances of the webserver, and must remain constant with
deployments of new versions of the app. The best place to store this
value is in a deployment pipeline configuration, or a configuration
server.

```sh
TOKEN_SECRET_PASSPHRASE="asecretwhichmustnotbeknown" ./index.js
```

**If this value ever changes, you will need to regenerate all key
pairs. This will invalidate any active sessions, forcing all users to
reauthenticate.**

## MongoDB

### User authentication (access control)

Before configuring authentication, you should create the database,
collections and indices necessary; the `refacto` user will not have
permission to change these. You can do this by running the application
without exposing it to the internet; after startup the configuration
will be complete.

1. Create users:

   ```
   use admin
   db.createUser({
     user: 'admin',
     pwd: '<something secret>',
     roles: [
       { role: 'userAdminAnyDatabase', db: 'admin' },
       'readWriteAnyDatabase',
     ],
   });

   use refacto
   db.createUser({
     user: 'refacto',
     pwd: '<another secret>',
     roles: [
       { role: 'readWrite', db: 'refacto' },
     ],
   });
   ```

2. Enforce authorization:

   ```sh
   echo 'security.authorization: enabled' >> /usr/local/etc/mongod.conf
   brew services restart mongodb
   ```

You can now connect as the `admin` user:

```sh
mongo --authenticationDatabase admin -u admin -p
```

And configure Refacto to connect as the `refacto` user:

```sh
DB_URL="mongodb://refacto:<pass>@localhost:27017/refacto" ./index.js
```

<https://docs.mongodb.com/manual/tutorial/enable-authentication/>

### Encrypted communication

To enable SSL (encrypted) communications, but without server or client
identity checks:

```sh
# macOS
MONGO_VAR="/usr/local/var/mongodb"
MONGO_CONF="/usr/local/etc/mongod.conf"

# Ubuntu
MONGO_VAR="/var/mongodb"
MONGO_CONF="/etc/mongod.conf"

openssl req \
  -x509 \
  -newkey rsa:4096 \
  -keyout "$MONGO_VAR/server-key.pem" \
  -out "$MONGO_VAR/server-cert.pem" \
  -subj "/C=/ST=/L=/O=/OU=/CN=localhost" \
  -nodes \
  -days 36500 \
  -batch

cat \
  "$MONGO_VAR/server-key.pem" \
  "$MONGO_VAR/server-cert.pem" \
  > "$MONGO_VAR/server.pem"

cat <<EOF >> "$MONGO_CONF"
net.ssl:
  mode: requireSSL
  PEMKeyFile: $MONGO_VAR/server.pem
EOF

# macOS
brew services restart mongodb

# Ubuntu
sudo service mongod restart
```

After enabling security, change the database URL when starting Refacto:

```sh
DB_URL="mongodb://localhost:27017/refacto?ssl=true" ./index.js
```

Note that after enabling this, unless you also configure identity
checks, you will need to skip certificate validation when connecting
via the commandline:

```sh
mongo --ssl --sslAllowInvalidCertificates
```

### Client / server identity checks

If the database is running on a separate server, you should enable
client & server identity checks. The following resources offer
guidance:

- <https://docs.mongodb.com/manual/tutorial/configure-ssl/>
- <https://medium.com/@rajanmaharjan/secure-your-mongodb-connections-ssl-tls-92e2addb3c89>
