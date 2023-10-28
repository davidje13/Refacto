#!/bin/sh
set -e;

BASEDIR="$(dirname "$0")/..";
if echo " $* " | grep ' --force ' > /dev/null; then
  FORCE='true';
fi;

if grep 'ependencies"' "$BASEDIR/package.json" > /dev/null; then
  echo >&2;
  echo >&2;
  echo 'Dependencies should not be installed in root package.json!' >&2;
  echo '- remove the dependencies and devDependencies' >&2;
  echo '- add the dependencies to the desired subproject instead' >&2;
  echo '- re-run install' >&2;
  echo >&2;
  echo >&2;
  rm -rf "$BASEDIR/node_modules";
  exit 1;
fi

install_subproject() {
  local PROJECT="$1";
  if [ ! -d "$BASEDIR/src/$PROJECT/node_modules" ] || [ "$FORCE" == 'true' ]; then
    echo;
    echo "Installing $PROJECT dependencies...";
    DISABLE_OPENCOLLECTIVE=1 \
    npm --prefix="$BASEDIR/src/$PROJECT" install --quiet;
  fi;
}

install_subproject 'frontend';
install_subproject 'backend';
if [ "${SKIP_E2E_DEPS:-false}" != 'true' ]; then
  install_subproject 'e2e';
fi;
