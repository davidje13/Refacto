#!/bin/bash
set -e;

BASEDIR="$(dirname "$0")/..";
${PARALLEL_E2E:=true}

echo;
echo 'Testing frontend...';
npm --prefix="$BASEDIR/frontend" test --silent;

echo;
echo 'Testing backend...';
npm --prefix="$BASEDIR/backend" test --silent;

echo;
echo 'Running end-to-end tests...';
PARALLEL_E2E="$PARALLEL_E2E" \
"$BASEDIR/scripts/e2e.sh";

echo 'Testing complete: pass.';
