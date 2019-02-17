#!/bin/sh
set -e;

BASEDIR="$(dirname "$0")/..";

"$BASEDIR/scripts/install.sh";

echo 'Building frontend...';
npm --prefix="$BASEDIR/frontend" run build;

echo 'Building backend...';
npm --prefix="$BASEDIR/backend" run build;

echo 'Combining output...';
rm -rf "$BASEDIR/build" || true;
cp -R "$BASEDIR/backend/build" "$BASEDIR/build";
cp -Rf "$BASEDIR/frontend/build/"* "$BASEDIR/build/static";

echo 'Generating package.json...';
sed -e 's/neutrino start.*"/node index.js"/' \
  < "$BASEDIR/backend/package.json" \
  > "$BASEDIR/build/package.json";
cp "$BASEDIR/backend/package-lock.json" "$BASEDIR/build";

echo 'Done.';
