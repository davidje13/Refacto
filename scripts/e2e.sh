#!/bin/sh
set -e;

BASEDIR="$(dirname "$0")/..";

"$BASEDIR/scripts/install.sh";

LOGS="$BASEDIR/e2e/build";
mkdir -p "$LOGS";

if [[ -z "$TARGET_HOST" ]]; then
  PORT="${PORT:-5000}";

  # Build and launch all-in-one server
  "$BASEDIR/scripts/build.sh";

  npm --prefix="$BASEDIR/build" install --production;

  PORT="$PORT" \
  npm --prefix="$BASEDIR/build" start \
    > "$LOGS/app.log" 2>&1 & APP_PID="$!";

  trap "kill '$APP_PID'; false" EXIT;

  # Wait for startup
  sleep 1;

  TARGET_HOST="http://localhost:$PORT/";
fi;

export TARGET_HOST;

ANY_E2E='false';

# Run tests

if which chromedriver > /dev/null; then
  echo 'E2E testing in Chrome...';
  SELENIUM_BROWSER=chrome \
  npm --prefix="$BASEDIR/e2e" test;
  ANY_E2E='true';
else
  echo 'Skipping E2E testing in Chrome' >&2;
  echo >&2;
  echo 'To run end to end tests in Chrome:' >&2;
  echo '- download chromedriver from http://chromedriver.chromium.org/downloads' >&2;
  echo '- unzip' >&2;
  echo '- run command: install chromedriver /usr/local/bin' >&2;
  echo >&2;
fi;

if which geckodriver > /dev/null; then
  echo 'E2E testing in Firefox...';
  SELENIUM_BROWSER=firefox \
  npm --prefix="$BASEDIR/e2e" test;
  ANY_E2E='true';
else
  echo 'Skipping E2E testing in Firefox' >&2;
  echo >&2;
  echo 'To run end to end tests in Firefox:' >&2;
  echo '- download geckodriver from https://github.com/mozilla/geckodriver/releases' >&2;
  echo '- extract the file' >&2;
  echo '- run command: install geckodriver /usr/local/bin' >&2;
  echo >&2;
fi;

# Shutdown app server
if [[ -n "$APP_PID" ]]; then
  kill "$APP_PID";
  trap - EXIT;
fi;

if [[ "$ANY_E2E" == 'false' ]]; then
  echo 'Did not run any end-to-end tests as no drivers were found.';
  false;
fi;

echo 'Done.';
