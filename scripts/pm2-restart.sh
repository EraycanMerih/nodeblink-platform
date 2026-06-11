#!/usr/bin/env bash
# Stop NodeBlink PM2 apps, free the app port, start Next.js once.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"

# Internal app port (nginx proxies api.nodeblink.dev -> this port).
APP_PORT="${NODEBLINK_PORT:-3001}"

if command -v sudo >/dev/null 2>&1; then
  SUDO="sudo"
else
  SUDO=""
fi

free_port() {
  local port="$1"
  ${SUDO} fuser -k "${port}/tcp" 2>/dev/null || fuser -k "${port}/tcp" 2>/dev/null || true
  if command -v lsof >/dev/null 2>&1; then
    ${SUDO} lsof -ti:"${port}" | xargs -r kill -9 2>/dev/null || true
  fi
}

echo "==> Stopping NodeBlink PM2 processes"
pm2 stop nodeblink nodeblink-next nodeblink-api nodeblink-express 2>/dev/null || true
pm2 delete nodeblink nodeblink-next nodeblink-api nodeblink-express 2>/dev/null || true

echo "==> Freeing ports 3000 and ${APP_PORT} (legacy + current)"
free_port 3000
free_port "${APP_PORT}"
${SUDO} pkill -f "next-server" 2>/dev/null || pkill -f "next-server" 2>/dev/null || true
sleep 2

if command -v ss >/dev/null 2>&1; then
  echo "==> Port status before start"
  ${SUDO} ss -tlnp | grep -E ':3000|:3001' || true
fi

export NODEBLINK_PORT="${APP_PORT}"
export PORT="${APP_PORT}"

echo "==> Starting NodeBlink on port ${APP_PORT}"
pm2 start ecosystem.config.js --env production --update-env
sleep 8

if ! ${SUDO} ss -tln 2>/dev/null | grep -q ":${APP_PORT} " && ! ss -tln 2>/dev/null | grep -q ":${APP_PORT} "; then
  echo "ERROR: nothing listening on port ${APP_PORT}"
  pm2 logs nodeblink --lines 80 --nostream || true
  exit 1
fi

pm2 save
pm2 status
echo "NodeBlink listening on http://127.0.0.1:${APP_PORT}"
