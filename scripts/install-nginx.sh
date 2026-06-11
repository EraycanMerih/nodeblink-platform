#!/usr/bin/env bash
# Run on the DigitalOcean droplet as root.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="/etc/nginx/sites-available/nodeblink"
ENABLED_DIR="/etc/nginx/sites-enabled"

if command -v sudo >/dev/null 2>&1; then
  SUDO="sudo"
else
  SUDO=""
fi

if ! command -v nginx >/dev/null 2>&1; then
  ${SUDO} apt-get update -qq
  ${SUDO} apt-get install -y nginx
  ${SUDO} systemctl enable nginx
  ${SUDO} systemctl start nginx
fi

if command -v ufw >/dev/null 2>&1; then
  if ${SUDO} ufw status 2>/dev/null | grep -q "Status: active"; then
    ${SUDO} ufw allow "Nginx Full" >/dev/null 2>&1 || true
  fi
fi

${SUDO} cp "${ROOT}/nginx/nodeblink.conf.template" "${TARGET}"
${SUDO} ln -sf "${TARGET}" "${ENABLED_DIR}/nodeblink"
${SUDO} rm -f "${ENABLED_DIR}/default" 2>/dev/null || true

# Remove old enabled site links/files that still claim api.nodeblink.dev.
for candidate in $("${SUDO}" sh -c "ls -1 ${ENABLED_DIR} 2>/dev/null || true"); do
  if [ "$candidate" = "nodeblink" ]; then
    continue
  fi
  candidate_path="${ENABLED_DIR}/${candidate}"
  if "${SUDO}" sh -c "grep -q 'server_name[[:space:]]\\+api\\.nodeblink\\.dev' \"${candidate_path}\" 2>/dev/null"; then
    echo "Disabling conflicting nginx site: ${candidate_path}"
    ${SUDO} rm -f "${candidate_path}"
  fi
done

${SUDO} nginx -t
${SUDO} systemctl reload nginx

echo "Nginx configured: all traffic -> Next.js :3001"
