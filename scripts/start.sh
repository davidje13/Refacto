#!/bin/sh
set -e;

BASEDIR="$(dirname "$0")/..";

API_PORT="${PORT:-5000}";
(( APP_PORT = API_PORT + 1 ));

FAKE_SSO='true';
if [[ -n "$GOOGLE_CLIENT_ID" ]]; then
  FAKE_SSO='false';
fi;
if [[ " $* " == *' --fake-sso '* ]]; then
  FAKE_SSO='true';
fi;

if [[ "$FAKE_SSO" == 'true' ]]; then
  echo 'Using fake authentication provider';
  (( FAKE_SSO_PORT = API_PORT + 2 ));
  FAKE_SSO_HOST="http://localhost:$FAKE_SSO_PORT";
  export GOOGLE_CLIENT_ID='fake-client-id';
  export GOOGLE_AUTH_URL="$FAKE_SSO_HOST/auth";
  export GOOGLE_TOKEN_INFO_URL="$FAKE_SSO_HOST/tokeninfo";
fi;

echo 'Running frontend...';

# Continue with script after failure so everything closes down nicely
set +e;

PORT="$APP_PORT" \
npm --prefix="$BASEDIR/frontend" start --silent & APP_PID="$!";

trap "kill '$APP_PID'" EXIT;

echo 'Running backend...';

PORT="$API_PORT" \
FORWARD_HOST="http://localhost:$APP_PORT" \
FAKE_SSO_PORT="$FAKE_SSO_PORT" \
npm --prefix="$BASEDIR/backend" start --silent;
