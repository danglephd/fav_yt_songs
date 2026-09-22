#!/usr/bin/env bash
set -euo pipefail

TEN_PROJECT="proja21"
HOSTING_SITE="proja21-27a31"
PUBLIC_DIR="dist/fav_yt_songs"
SERVICE_ACCOUNT_PATH="firebase-dauduata.json"
SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
SERVICE_ACCOUNT="$SCRIPT_DIR/firebase/$SERVICE_ACCOUNT_PATH"

if [[ ! -f "$SERVICE_ACCOUNT" ]]; then
  echo "ERROR: Service Account not found: $SERVICE_ACCOUNT" >&2
  exit 1
fi

if command -v fnm >/dev/null 2>&1; then
  fnm use 22
else
  echo "WARN: fnm not found in PATH; assuming Node.js 22 is already active."
fi

export GOOGLE_APPLICATION_CREDENTIALS="$SERVICE_ACCOUNT"

yarn build
if [[ ! -f "$SCRIPT_DIR/$PUBLIC_DIR/index.html" ]]; then
  echo "ERROR: Build output not found: $SCRIPT_DIR/$PUBLIC_DIR/index.html" >&2
  exit 1
fi
firebase deploy --project "$TEN_PROJECT" --only hosting

echo "============================================================"
echo "DEPLOY SUCCESS"
echo "============================================================"
echo "Project: $TEN_PROJECT"
echo "Hosting site: $HOSTING_SITE"
echo "URL: https://${HOSTING_SITE}.firebaseapp.com/"
echo "URL: https://${HOSTING_SITE}.web.app/"
echo "============================================================"
