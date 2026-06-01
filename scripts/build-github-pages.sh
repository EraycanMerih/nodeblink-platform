#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${ROOT}/_site"
API_URL="${NODEBLINK_API_URL:-https://api.nodeblink.dev}"
SITE_URL="${NODEBLINK_SITE_URL:-https://nodeblink.dev}"
APP_URL="${NODEBLINK_APP_URL:-https://api.nodeblink.dev}"

rm -rf "${OUT}"
mkdir -p "${OUT}"

cp "${ROOT}/static-site/index.html" "${ROOT}/static-site/dashboard.html" "${OUT}/"
cp -r "${ROOT}/assets" "${OUT}/" 2>/dev/null || true
cp -r "${ROOT}/public/"* "${OUT}/" 2>/dev/null || true

cat > "${OUT}/config.js" <<EOF
window.NODEBLINK_CONFIG = {
  apiUrl: "${API_URL}",
  siteUrl: "${SITE_URL}",
  appUrl: "${APP_URL}",
};
EOF

echo "Built GitHub Pages bundle in _site (app → ${APP_URL})"
