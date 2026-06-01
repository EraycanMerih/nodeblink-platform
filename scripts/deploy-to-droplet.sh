#!/usr/bin/env bash
set -euo pipefail

# Usage: DEPLOY_USER=deploy DEPLOY_HOST=1.2.3.4 DEPLOY_PATH=/opt/nodeblink ./scripts/deploy-to-droplet.sh

: "${DEPLOY_USER:?set DEPLOY_USER}"
: "${DEPLOY_HOST:?set DEPLOY_HOST}"
: "${DEPLOY_PATH:?set DEPLOY_PATH}"

ROOT=$(pwd)

echo "Syncing repository to ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"

# Rsync project excluding node_modules and .git
rsync -az --delete --exclude node_modules --exclude .git --exclude .next --exclude dev.db \
  --exclude .env --exclude .env.local "$ROOT/" "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/repo"

ssh ${DEPLOY_USER}@${DEPLOY_HOST} "cat > /tmp/nodeblink_deploy.sh <<EOF
#!/usr/bin/env bash
set -euo pipefail
cd ${DEPLOY_PATH}/repo
# install docker & docker-compose if desired, or use provided PM2
if command -v docker >/dev/null 2>&1; then
  if [ -f docker-compose.prod.yml ]; then
    docker compose -f docker-compose.prod.yml pull || true
    docker compose -f docker-compose.prod.yml up -d --build
  fi
else
  # fallback: install deps, build, and run pm2
  npm ci --production=false
  npm run build:next
  pm2 stop ecosystem.config.js || true
  pm2 start ecosystem.config.js --update-env
fi
EOF
chmod +x /tmp/nodeblink_deploy.sh
bash /tmp/nodeblink_deploy.sh
rm /tmp/nodeblink_deploy.sh"

echo "Deployed. Check the droplet logs for errors: ssh ${DEPLOY_USER}@${DEPLOY_HOST}"
