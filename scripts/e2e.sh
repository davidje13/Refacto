#!/bin/bash
set -e;
set -o pipefail;

BASEDIR="$(dirname "$0")/..";
BUILDDIR="$BASEDIR/build";

E2E_WORKDIR="$BASEDIR/src/e2e/build";
DOWNLOADS="$E2E_WORKDIR/downloads";

rm -rf "$E2E_WORKDIR" || true;
mkdir -p "$E2E_WORKDIR";
mkdir -p "$DOWNLOADS";

if [[ -z "$TARGET_HOST" ]]; then
  PORT="${PORT:-5010}";

  # Build and launch all-in-one server
  "$BASEDIR/scripts/build.sh" --keep-deps;

  if [[ ! -d "$BUILDDIR/node_modules" ]]; then
    echo "Installing production dependencies...";
    npm --prefix="$BUILDDIR" install --production --quiet;
  fi;

  echo 'Using mock authentication provider';
  (( MOCK_SSO_PORT = PORT + 2 ));
  MOCK_SSO_HOST="http://localhost:$MOCK_SSO_PORT";
  export SSO_GOOGLE_CLIENT_ID='mock-client-id';
  export SSO_GOOGLE_AUTH_URL="$MOCK_SSO_HOST/auth";
  export SSO_GOOGLE_TOKEN_INFO_URL="$MOCK_SSO_HOST/tokeninfo";

  echo 'Using randomised secrets';
  export $("$BASEDIR/scripts/random-secrets.js" | tee /dev/stderr | xargs);

  # TODO replace express with something else to be able to add --disallow-code-generation-from-strings
  PORT="$PORT" \
  MOCK_SSO_PORT="$MOCK_SSO_PORT" \
  SERVER_BIND_ADDRESS="localhost" \
  DB_URL="memory://refacto?simulatedLatency=50" \
  node \
    --disable-proto throw \
    "$BUILDDIR/index.js" \
    > "$E2E_WORKDIR/app.log" 2>&1 & APP_PID="$!";

  trap "kill '$APP_PID'; false" EXIT;

  # Wait for startup
  sleep "${E2E_LAUNCH_DELAY:-1}";

  TARGET_HOST="http://localhost:$PORT/";
fi;

export TARGET_HOST;

# Run tests

E2E_PIDS="";
FAILED='';

function launch_e2e() {
  NAME="$1";
  if [[ -n "$BROWSER" && "$BROWSER" != "$NAME" ]]; then
    echo "Skipping E2E testing in $NAME";
    return;
  fi;
  echo "E2E testing in $NAME...";
  if [[ "$PARALLEL_E2E" == 'true' ]]; then
    SELENIUM_BROWSER="$NAME" \
    npm --prefix="$BASEDIR/src/e2e" test --quiet 2>&1 | sed "s/^/$NAME: /" &
    E2E_PIDS="$E2E_PIDS $!";
  else
    if ! SELENIUM_BROWSER="$NAME" npm --prefix="$BASEDIR/src/e2e" test --quiet; then
      FAILED='true';
    fi;
    E2E_PIDS="-";
  fi;
}

launch_e2e 'chrome';
launch_e2e 'firefox';

if [[ "$E2E_PIDS" != '' && "$E2E_PIDS" != '-' ]]; then
  for PID in $E2E_PIDS; do
    if ! wait "$PID"; then
      FAILED='true';
    fi;
  done;
fi;

# Shutdown app server
if [[ -n "$APP_PID" ]]; then
  kill "$APP_PID";
  trap - EXIT;
fi;

if [[ "$E2E_PIDS" == '' ]]; then
  echo 'Did not run any end-to-end tests as no drivers were found.';
  false;
fi;

if [[ "$FAILED" != '' ]]; then
  echo;
  echo 'Application logs:';
  sed "s/^/> /" < "$E2E_WORKDIR/app.log";
  echo;
  echo 'Files downloaded:';
  ls "$DOWNLOADS";
  echo;
  echo 'End-to-end tests failed.';
  false;
fi;

echo;
echo 'End-to-end tests complete.';
