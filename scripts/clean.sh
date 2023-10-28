#!/bin/sh
set -e;

BASEDIR="$(dirname "$0")/..";

echo 'Cleaning build...';
rm -rf "$BASEDIR/src/backend/build" || true;
rm -rf "$BASEDIR/src/frontend/build" || true;
rm -rf "$BASEDIR/src/e2e/build" || true;
rm -rf "$BASEDIR/build" || true;

echo 'Cleaning dependencies...';
rm -rf "$BASEDIR/src/backend/node_modules" || true;
rm -rf "$BASEDIR/src/frontend/node_modules" || true;
rm -rf "$BASEDIR/src/e2e/node_modules" || true;

echo 'Cleaning complete.';
