#!/bin/bash
set -e;
set -o pipefail;

BASEDIR="$(dirname "$0")/..";
BUILDDIR="$BASEDIR/build";

BUILD_PIDS="";

function launch_build() {
  NAME="$1";
  echo "Building $NAME...";
  if [[ "${PARALLEL_BUILD:-true}" == 'true' ]]; then
    npm --prefix="$BASEDIR/src/$NAME" run build --quiet 2>&1 | sed "s/^/$NAME: /" &
    BUILD_PIDS="$BUILD_PIDS $!";
  else
    npm --prefix="$BASEDIR/src/$NAME" run build --quiet;
  fi;
}

launch_build 'frontend';
launch_build 'backend';

FAILED='';
if [[ "$BUILD_PIDS" != '' ]]; then
  for PID in $BUILD_PIDS; do
    if ! wait "$PID"; then
      FAILED='true';
    fi;
  done;
fi;

if [[ "$FAILED" == 'true' ]]; then
  echo 'Build failed.';
  false;
fi;

PRESERVE_NODE_MODULES='false';
if [[
  -d "$BUILDDIR/node_modules" &&
  " $* " == *' --keep-deps '* &&
  "$BUILDDIR/node_modules" -nt "$BASEDIR/src/backend/package.json"
]]; then
  PRESERVE_NODE_MODULES='true';
fi;

if [[ "$PRESERVE_NODE_MODULES" == 'true' ]]; then
  mv "$BUILDDIR/node_modules" "$BASEDIR/build_node_modules";
fi;

echo 'Combining output...';
rm -rf "$BUILDDIR" || true;
cp -R "$BASEDIR/src/backend/build" "$BUILDDIR";
rm -rf "$BUILDDIR/static" || true;
cp -R "$BASEDIR/src/frontend/build" "$BUILDDIR/static";
chmod +x "$BUILDDIR/index.js";

echo 'Compressing static resources...';
"$BASEDIR/scripts/compress.js" "$BUILDDIR/static";

if [[ "$PRESERVE_NODE_MODULES" == 'true' ]]; then
  echo 'Restoring node_modules...';
  mv "$BASEDIR/build_node_modules" "$BUILDDIR/node_modules";
fi;

echo 'Generating package.json...';
< "$BASEDIR/src/backend/package.json" \
  grep -v '"file:' \
  | "$BASEDIR/scripts/mutate-json.js" \
  'name="refacto-app"' \
  'scripts={"start": "./index.js"}' \
  'optionalDependencies=' \
  'devDependencies=' \
  > "$BUILDDIR/package.json";
cp "$BASEDIR/src/backend/package-lock.json" "$BUILDDIR";
cp "$BASEDIR/deployment/.dockerignore" "$BUILDDIR";

echo 'Build complete.';
