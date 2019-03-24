#!/bin/sh
set -e;

BASEDIR="$(dirname "$0")/..";

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
echo 'Linting complete.';
