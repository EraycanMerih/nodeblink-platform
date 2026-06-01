# NodeBlink — production deployment

## Architecture

| URL | Host | App |
|-----|------|-----|
| `https://nodeblink.dev` | GitHub Pages | Marketing site (`static-site/`) — links to app |
| `https://api.nodeblink.dev` | DigitalOcean **165.245.222.21** | **Next.js only** (port 3000) |

Everything runs on Next.js: landing, Creator Studio, checkout, Solana Actions, API.

## DigitalOcean droplet

```bash
git clone https://github.com/EraycanMerih/nodeblink-platform.git /opt/nodeblink/repo
cd /opt/nodeblink/repo
cp .env.example .env   # fill secrets
bash scripts/setup-droplet.sh
```

Nginx (all traffic → Next.js):

```bash
bash scripts/install-nginx.sh
sudo certbot --nginx -d api.nodeblink.dev
```

**Health checks**

- `https://api.nodeblink.dev/api/health`
- `https://api.nodeblink.dev/creator/demo`
- `https://api.nodeblink.dev/dashboard`

## GitHub Pages (nodeblink.dev)

Push to `main` → workflow publishes `static-site/` to `gh-pages`.

- `/dashboard` → redirects to `https://api.nodeblink.dev/dashboard`
- `/creator/demo` → redirects to demo checkout

## DNS

| Name | Type | Value |
|------|------|--------|
| `nodeblink.dev` | GitHub Pages | (repo Settings → Pages) |
| `api.nodeblink.dev` | A | `165.245.222.21` |

## Environment

Set on the droplet `.env`:

```txt
PORT=3000
PUBLIC_BASE_URL=https://api.nodeblink.dev
NEXT_PUBLIC_BASE_URL=https://api.nodeblink.dev
DATABASE_URL=postgresql://...@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true
```
