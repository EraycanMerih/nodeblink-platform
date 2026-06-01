#!/usr/bin/env bash
# Run on the DigitalOcean droplet as root.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="/etc/nginx/sites-available/nodeblink"

cp "${ROOT}/nginx/nodeblink.conf.template" "${TARGET}"
ln -sf "${TARGET}" /etc/nginx/sites-enabled/nodeblink
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

nginx -t
systemctl reload nginx

echo "Nginx configured: all traffic → Next.js :3000"
