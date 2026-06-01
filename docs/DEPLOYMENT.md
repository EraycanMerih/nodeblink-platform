# NodeBlink deployment

Split layout: **static frontend on GitHub Pages**, **API + Solana Actions on DigitalOcean**, **database on Supabase**.

## Architecture

| Layer | Host | Purpose |
|-------|------|---------|
| Marketing + legacy dashboard UI | GitHub Pages (`nodeblink.dev`) | `index.html`, `dashboard.html` |
| Express API + uploads | DigitalOcean `165.245.222.21` | `/api/*` (blinks, metrics) — port **8080** |
| Next.js (Actions, checkout, studio) | Same droplet | `/actions.json`, `/api/v1/*`, `/creator/*` — port **3000** |
| PostgreSQL | Supabase | Pooled connection from droplet |

DNS (recommended):

- `nodeblink.dev` → GitHub Pages
- `api.nodeblink.dev` → `165.245.222.21` (A record)

## Secrets (never commit)

Set only on the **droplet** (PM2, systemd, or `/opt/nodeblink/.env`):

- `DATABASE_URL` — Supabase **Session pooler** (IPv4-safe for DO)
- `DIRECT_URL` — Supabase direct host (for `prisma migrate deploy` only)
- `SOLANA_RPC_URL`, `NODEBLINK_ENC_KEY`, `TREASURY_WALLET`, `ADMIN_SECRET`, `DOWNLOAD_SECRET`

Copy from `.env.example` and fill in values locally.

### Supabase from DigitalOcean

Direct host `db.ozthlvybyerymvyytknx.supabase.co` is often **not IPv4-compatible**. Use the **Session pooler** string from:

Supabase → Project Settings → Database → **Connection string** → **Session pooler**

Example shape (replace `REGION` and password):

```txt
DATABASE_URL=postgresql://postgres.ozthlvybyerymvyytknx:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:YOUR_PASSWORD@db.ozthlvybyerymvyytknx.supabase.co:5432/postgres
```

Run migrations from your PC or CI with `DIRECT_URL` set, then run the app on the droplet with `DATABASE_URL` (pooler).

## GitHub Pages (frontend)

Workflow: `.github/workflows/pages.yml`

- Builds `_site/` from `index.html`, `dashboard.html`, `assets/`, `public/`
- Injects `config.js` with `apiUrl: https://api.nodeblink.dev` (no secrets)
- Publishes to branch `gh-pages`

In GitHub → Settings → Pages → Source: **Deploy from branch** → `gh-pages` / root.

## DigitalOcean (backend)

On the droplet (Ubuntu 22.04+):

```bash
# Node 20, nginx, pm2
sudo apt update && sudo apt install -y nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

git clone https://github.com/EraycanMerih/nodeblink-platform.git /opt/nodeblink
cd /opt/nodeblink
cp .env.example .env   # edit with real secrets
npm ci
npx prisma migrate deploy
npm run prisma:seed
npm run build:next

pm2 start ecosystem.config.js --update-env
pm2 start server.js --name nodeblink-api --update-env
pm2 save
```

Nginx (`nginx/nodeblink.conf.template`): proxy `api.nodeblink.dev` to Next `:3000` and Express `:8080` under `/api` for legacy routes.

## CORS

`CORS_ORIGINS` must include your Pages origin, e.g.:

```txt
CORS_ORIGINS=https://nodeblink.dev,https://eraycanmerih.github.io
```

## Verify

- https://nodeblink.dev — landing (Pages)
- https://nodeblink.dev/dashboard.html — creator dashboard → calls `https://api.nodeblink.dev/api`
- https://api.nodeblink.dev/actions.json — Solana Actions discovery
- https://api.nodeblink.dev/creator/demo — checkout
