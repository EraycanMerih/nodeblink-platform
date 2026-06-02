#!/usr/bin/env bash
# Run ON the DigitalOcean droplet (165.245.222.21) as root or deploy user.
set -euo pipefail
set -x

APP_DIR="${APP_DIR:-/opt/nodeblink}"
REPO_URL="${REPO_URL:-https://github.com/EraycanMerih/nodeblink-platform.git}"
BRANCH="${BRANCH:-main}"

SUDO=""
if [ "$(id -u)" -eq 0 ]; then
  SUDO=""
elif command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
  SUDO="sudo"
fi

if [ "${APP_DIR}" = "/opt/nodeblink" ] && [ -z "${SUDO}" ] && [ "$(id -u)" -ne 0 ]; then
  APP_DIR="${HOME}/nodeblink"
fi

echo "==> Installing Node 20 if needed"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | ${SUDO} bash -
  ${SUDO} apt-get install -y nodejs
fi

command -v pm2 >/dev/null 2>&1 || ${SUDO} npm install -g pm2

echo "==> Syncing application to ${APP_DIR}"
if [ "${APP_DIR}" = "/opt/nodeblink" ]; then
  ${SUDO} mkdir -p "${APP_DIR}"
  ${SUDO} chown -R "$(id -un)":"$(id -gn)" "${APP_DIR}" || true
else
  mkdir -p "${APP_DIR}"
fi
if [ -d "${APP_DIR}/repo/.git" ]; then
  cd "${APP_DIR}/repo"
  git fetch origin
  git checkout "${BRANCH}"
  git pull origin "${BRANCH}"
else
  git clone --branch "${BRANCH}" "${REPO_URL}" "${APP_DIR}/repo"
  cd "${APP_DIR}/repo"
fi

if [ ! -f .env ]; then
  echo "ERROR: Create ${APP_DIR}/repo/.env from .env.example before running setup."
  exit 1
fi

echo "==> Installing dependencies and building"
npm ci --ignore-scripts
npx prisma generate
npx prisma migrate deploy || true
npm run prisma:seed || true
npm run build:next

echo "==> Stopping legacy services/processes"
if command -v systemctl >/dev/null 2>&1; then
  ${SUDO} systemctl stop nodeblink 2>/dev/null || true
  ${SUDO} systemctl disable nodeblink 2>/dev/null || true
fi

bash scripts/pm2-restart.sh

if [ "$(id -u)" -eq 0 ] || (command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null); then
  bash scripts/install-nginx.sh
else
  echo "Skipping nginx install: no sudo permission for current user"
fi

echo "==> Done. Verify: curl http://127.0.0.1:3001/api/health"
