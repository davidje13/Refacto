#!/bin/sh
set -e;

BASEDIR="$(dirname "$0")/..";

"$BASEDIR/scripts/install.sh";

echo 'Building frontend...';
npm --prefix="$BASEDIR/frontend" run build --silent;

echo 'Building backend...';
npm --prefix="$BASEDIR/backend" run build --silent;

echo 'Combining output...';
rm -rf "$BASEDIR/build" || true;
cp -R "$BASEDIR/backend/build" "$BASEDIR/build";
cp -Rf "$BASEDIR/frontend/build/"* "$BASEDIR/build/static";

echo 'Generating package.json...';
node "$BASEDIR/scripts/mutate-json.js" \
  'scripts={"start": "node index.js"}' \
  'devDependencies=' \
  < "$BASEDIR/backend/package.json" \
  > "$BASEDIR/build/package.json";
cp "$BASEDIR/backend/package-lock.json" "$BASEDIR/build";

echo 'Done.';
