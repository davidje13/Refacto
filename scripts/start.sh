#!/bin/sh
set -e;

BASEDIR="$(dirname "$0")/..";

"$BASEDIR/scripts/install.sh";

API_PORT="${PORT:-5000}";
(( APP_PORT = API_PORT + 1 ));

echo 'Running frontend...';

# Continue with script after failure so everything closes down nicely
set +e;

PORT="$APP_PORT" \
npm --prefix="$BASEDIR/frontend" start --silent & APP_PID="$!";

trap "kill '$APP_PID'" EXIT;

echo 'Running backend...';

PORT="$API_PORT" \
FORWARD_HOST="http://localhost:$APP_PORT" \
npm --prefix="$BASEDIR/backend" start --silent;
