#!/usr/bin/env bash
# Run ON the DigitalOcean droplet (165.245.222.21) as root or deploy user.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/nodeblink}"
REPO_URL="${REPO_URL:-https://github.com/EraycanMerih/nodeblink-platform.git}"
BRANCH="${BRANCH:-main}"

echo "==> Installing Node 20 if needed"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

command -v pm2 >/dev/null 2>&1 || npm install -g pm2

echo "==> Syncing application to ${APP_DIR}"
mkdir -p "${APP_DIR}"
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
npm ci
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed || true
npm run build:next

echo "==> Starting PM2 (Next.js only)"
pm2 delete nodeblink nodeblink-next nodeblink-api 2>/dev/null || true
pm2 start ecosystem.config.js --update-env
pm2 save

if command -v nginx >/dev/null 2>&1; then
  bash scripts/install-nginx.sh
fi

echo "==> Done. Verify: curl http://127.0.0.1:3000/api/health"
