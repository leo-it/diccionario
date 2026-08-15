#!/usr/bin/env bash
set -euo pipefail

# El emulador de Firestore exige JDK 21+.
# Esta Mac tiene Java 17 por defecto (trabajo): no hacemos `brew link openjdk@21`.
export JAVA_HOME="${JAVA_HOME_EMULATORS:-/opt/homebrew/opt/openjdk@21}"
export PATH="$JAVA_HOME/bin:$PATH"

exec pnpm dlx firebase-tools emulators:start \
  --import=./.emulator-data \
  --export-on-exit=./.emulator-data \
  "$@"
