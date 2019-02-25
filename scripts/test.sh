#!/bin/sh
set -e;

BASEDIR="$(dirname "$0")/..";

"$BASEDIR/scripts/install.sh";

echo;
echo 'Linting frontend...';
npm --prefix="$BASEDIR/frontend" run lint --silent;

echo;
echo 'Linting backend...';
npm --prefix="$BASEDIR/backend" run lint --silent;

echo;
echo 'Linting end-to-end tests...';
npm --prefix="$BASEDIR/e2e" run lint --silent;


echo;
echo 'Testing frontend...';
npm --prefix="$BASEDIR/frontend" test --silent;

echo;
echo 'Testing backend...';
npm --prefix="$BASEDIR/backend" test --silent;

echo;
echo 'Running end-to-end tests...';
"$BASEDIR/scripts/e2e.sh";


echo 'Done.';
