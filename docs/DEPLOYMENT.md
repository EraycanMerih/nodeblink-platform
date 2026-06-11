# NodeBlink — production deployment

## Architecture

| URL | Host | App |
|-----|------|-----|
| `https://nodeblink.dev` | DigitalOcean **165.245.222.21** | **Next.js** on internal port **3001** (nginx proxies 80/443 → 3001) |
| `https://api.nodeblink.dev` | DigitalOcean **165.245.222.21** | Domain alias (serves the same Next.js app) |

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
sudo bash scripts/install-nginx.sh
sudo bash scripts/setup-ssl.sh
```

HTTPS is required for production links (`https://api.nodeblink.dev`). HTTP on port 80 works without SSL, but browsers default to HTTPS and will show “connection refused” until `setup-ssl.sh` runs successfully.

**Health checks**

- `https://nodeblink.dev/api/health`
- `https://nodeblink.dev/creator/demo`
- `https://nodeblink.dev/dashboard`

## DNS

| Name | Type | Value |
|------|------|--------|
| `nodeblink.dev` | A | `165.245.222.21` |
| `www.nodeblink.dev` | CNAME | `nodeblink.dev` |
| `api.nodeblink.dev` | A | `165.245.222.21` |

## Environment

Set on the droplet `.env`:

```txt
PORT=3001
NODEBLINK_PORT=3001
PUBLIC_BASE_URL=https://nodeblink.dev
NEXT_PUBLIC_BASE_URL=https://nodeblink.dev
DATABASE_URL=postgresql://...@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true
```
