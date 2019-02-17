#!/bin/sh
set -e;

BASEDIR="$(dirname "$0")/..";

echo 'Cleaning build...';
rm -rf "$BASEDIR/backend/build" || true;
rm -rf "$BASEDIR/frontend/build" || true;
rm -rf "$BASEDIR/e2e/build" || true;
rm -rf "$BASEDIR/build" || true;

echo 'Cleaning dependencies...';
rm -rf "$BASEDIR/backend/node_modules" || true;
rm -rf "$BASEDIR/frontend/node_modules" || true;
rm -rf "$BASEDIR/e2e/node_modules" || true;

echo 'Done.';
