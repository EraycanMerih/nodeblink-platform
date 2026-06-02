#!/usr/bin/env bash
# Enable HTTPS for api.nodeblink.dev (Let's Encrypt via certbot).
set -euo pipefail

DOMAINS="${NODEBLINK_DOMAINS:-nodeblink.dev www.nodeblink.dev api.nodeblink.dev}"
EMAIL="${CERTBOT_EMAIL:-}"

SUDO=""
if [ "$(id -u)" -eq 0 ]; then
  SUDO=""
elif command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
  SUDO="sudo"
fi

DOMAIN_ARGS=()
for domain in ${DOMAINS}; do
  DOMAIN_ARGS+=("-d" "${domain}")
done

if ! command -v certbot >/dev/null 2>&1; then
  echo "Installing certbot..."
  ${SUDO} apt-get update -qq
  ${SUDO} apt-get install -y certbot python3-certbot-nginx
fi

if [ -z "${EMAIL}" ]; then
  echo "Running certbot without email (use CERTBOT_EMAIL for renewal notices)"
  certbot --nginx "${DOMAIN_ARGS[@]}" \
    --non-interactive \
    --agree-tos \
    --register-unsafely-without-email \
    --redirect
else
  certbot --nginx "${DOMAIN_ARGS[@]}" \
    --non-interactive \
    --agree-tos \
    -m "${EMAIL}" \
    --redirect
fi

echo "HTTPS enabled for ${DOMAINS}"
