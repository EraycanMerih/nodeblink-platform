#!/usr/bin/env bash
# Run on the DigitalOcean droplet as root.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="/etc/nginx/sites-available/nodeblink"

if command -v sudo >/dev/null 2>&1; then
  SUDO="sudo"
else
  SUDO=""
fi

${SUDO} cp "${ROOT}/nginx/nodeblink.conf.template" "${TARGET}"
${SUDO} ln -sf "${TARGET}" /etc/nginx/sites-enabled/nodeblink
${SUDO} rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

${SUDO} nginx -t
${SUDO} systemctl reload nginx

echo "Nginx configured: all traffic -> Next.js :3000"
