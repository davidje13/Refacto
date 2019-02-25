#!/bin/sh
set -e;

BASEDIR="$(dirname "$0")/..";
BUILDDIR="$BASEDIR/build";

"$BASEDIR/scripts/install.sh";

echo 'Building frontend...';
npm --prefix="$BASEDIR/frontend" run build --silent;

echo 'Building backend...';
npm --prefix="$BASEDIR/backend" run build --silent;

PRESERVE_NODE_MODULES='false';
if [[
  -d "$BUILDDIR/node_modules" &&
  " $* " == *' --keep-deps '* &&
  "$BUILDDIR/node_modules" -nt "$BASEDIR/backend/package.json"
]]; then
  PRESERVE_NODE_MODULES='true';
fi;

if [[ "$PRESERVE_NODE_MODULES" == 'true' ]]; then
  mv "$BUILDDIR/node_modules" "$BASEDIR/build_node_modules";
fi;

echo 'Combining output...';
rm -rf "$BUILDDIR" || true;
cp -R "$BASEDIR/backend/build" "$BUILDDIR";
mkdir -p "$BUILDDIR/static";
cp -Rf "$BASEDIR/frontend/build/"* "$BUILDDIR/static";

if [[ "$PRESERVE_NODE_MODULES" == 'true' ]]; then
  echo 'Restoring node_modules...';
  mv "$BASEDIR/build_node_modules" "$BUILDDIR/node_modules";
fi;

echo 'Generating package.json...';
node "$BASEDIR/scripts/mutate-json.js" \
  'scripts={"start": "node index.js"}' \
  'devDependencies=' \
  < "$BASEDIR/backend/package.json" \
  > "$BUILDDIR/package.json";
cp "$BASEDIR/backend/package-lock.json" "$BUILDDIR";

echo 'Done.';
