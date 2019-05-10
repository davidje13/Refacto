#!/bin/sh
set -e;
set -o pipefail;

BASEDIR="$(dirname "$0")/..";
BUILDDIR="$BASEDIR/build";
${PARALLEL_BUILD:=true}

BUILD_PIDS="";

function launch_build() {
  NAME="$1";
  echo "Building $NAME...";
  if [[ "$PARALLEL_BUILD" == 'true' ]]; then
    npm --prefix="$BASEDIR/$NAME" run build --silent 2>&1 | sed "s/^/$NAME: /" &
    BUILD_PIDS="$BUILD_PIDS $!";
  else
    npm --prefix="$BASEDIR/$NAME" run build --silent;
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

echo 'Build complete.';
