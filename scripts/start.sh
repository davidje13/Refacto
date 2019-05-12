#!/bin/sh
set -e;

BASEDIR="$(dirname "$0")/..";

API_PORT="${PORT:-5000}";
(( APP_PORT = API_PORT + 1 ));

MOCK_SSO='true';
if [[ -n "$SSO_GOOGLE_CLIENT_ID" || -n "$SSO_GITHUB_CLIENT_ID" ]]; then
  MOCK_SSO='false';
fi;
if [[ " $* " == *' --mock-sso '* ]]; then
  MOCK_SSO='true';
fi;

if [[ "$MOCK_SSO" == 'true' ]]; then
  echo 'Using mock authentication provider';
  (( MOCK_SSO_PORT = API_PORT + 2 ));
  MOCK_SSO_HOST="http://localhost:$MOCK_SSO_PORT";
  export SSO_GOOGLE_CLIENT_ID='mock-client-id';
  export SSO_GOOGLE_AUTH_URL="$MOCK_SSO_HOST/auth";
  export SSO_GOOGLE_TOKEN_INFO_URL="$MOCK_SSO_HOST/tokeninfo";
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
MOCK_SSO_PORT="$MOCK_SSO_PORT" \
SERVER_BIND_ADDRESS="localhost" \
npm --prefix="$BASEDIR/backend" start --silent;
