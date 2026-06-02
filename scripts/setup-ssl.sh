#!/usr/bin/env bash
# Enable HTTPS for api.nodeblink.dev (Let's Encrypt via certbot).
set -euo pipefail

DOMAIN="${NODEBLINK_API_DOMAIN:-api.nodeblink.dev}"
EMAIL="${CERTBOT_EMAIL:-}"

if ! command -v certbot >/dev/null 2>&1; then
  echo "Installing certbot..."
  apt-get update -qq
  apt-get install -y certbot python3-certbot-nginx
fi

if [ -z "${EMAIL}" ]; then
  echo "Running certbot without email (use CERTBOT_EMAIL for renewal notices)"
  certbot --nginx -d "${DOMAIN}" \
    --non-interactive \
    --agree-tos \
    --register-unsafely-without-email \
    --redirect
else
  certbot --nginx -d "${DOMAIN}" \
    --non-interactive \
    --agree-tos \
    -m "${EMAIL}" \
    --redirect
fi

echo "HTTPS enabled for https://${DOMAIN}"
