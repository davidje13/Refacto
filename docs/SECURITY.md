# Refacto security considerations

## HTTPS

This application runs a HTTP server which should be deployed behind a
reverse proxy (such as Apache HTTPD or NGINX) to enable HTTPS. The
proxy should also be configured to block or redirect HTTP traffic.

Deploying to a platform-as-a-service will handle this automatically.

## Passwords

All passwords are protected using the bcrypt hashing algorithm with a
work factor, individual salts, and a "brute-force salt".

### Work factor

If you have a powerful webserver, you can increase the hash work
factor:

```bash
PASSWORD_HASH_WORK_FACTOR=12 npm start
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

```bash
PASSWORD_SECRET_PEPPER=asecretwhichmustnotbeknown npm start
```

Currently it is not possible to cycle this secret value, as passwords
can only be re-hashed during a successful login.

**If this value ever changes, all passwords will become invalid.
If you specify a secret pepper, ensure it will never be lost!**

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

```bash
PRIVATE_KEY_PASSPHRASE=asecretwhichmustnotbeknown npm start
```

**If this value ever changes, you will need to regenerate all key
pairs. This will invalidate any active sessions, forcing all users to
reauthenticate.**
