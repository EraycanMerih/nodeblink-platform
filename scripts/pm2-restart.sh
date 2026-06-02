#!/usr/bin/env bash
# Stop all NodeBlink PM2 apps and anything bound to port 3000, then start Next.js once.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"

free_port_3000() {
  if command -v fuser >/dev/null 2>&1; then
    fuser -k 3000/tcp 2>/dev/null || true
  fi
  if command -v lsof >/dev/null 2>&1; then
    lsof -ti:3000 | xargs -r kill -9 2>/dev/null || true
  fi
  pkill -f "next-server" 2>/dev/null || true
  pkill -f "next start" 2>/dev/null || true
}

echo "==> Stopping NodeBlink PM2 processes"
pm2 stop nodeblink nodeblink-next nodeblink-api nodeblink-express 2>/dev/null || true
pm2 delete nodeblink nodeblink-next nodeblink-api nodeblink-express 2>/dev/null || true

echo "==> Freeing port 3000"
free_port_3000
sleep 2

if command -v ss >/dev/null 2>&1; then
  for _ in 1 2 3 4 5; do
    if ! ss -tln | grep -q ':3000 '; then
      break
    fi
    echo "Port 3000 still in use, retrying..."
    free_port_3000
    sleep 2
  done
fi

echo "==> Starting NodeBlink (Next.js)"
pm2 start ecosystem.config.js --env production --update-env
sleep 5
pm2 save
pm2 status
