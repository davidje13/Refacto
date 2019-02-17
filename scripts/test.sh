#!/bin/sh
set -e;

BASEDIR="$(dirname "$0")/..";

"$BASEDIR/scripts/install.sh";


echo 'Linting frontend...';
npm --prefix="$BASEDIR/frontend" run lint;

echo 'Linting backend...';
npm --prefix="$BASEDIR/backend" run lint;

echo 'Linting end-to-end tests...';
npm --prefix="$BASEDIR/e2e" run lint;


echo 'Testing frontend...';
npm --prefix="$BASEDIR/frontend" test;

echo 'Testing backend...';
npm --prefix="$BASEDIR/backend" test;

echo 'Running end-to-end tests...';
"$BASEDIR/scripts/e2e.sh";


echo 'Done.';
