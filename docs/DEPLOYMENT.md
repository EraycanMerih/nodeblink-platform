# NodeBlink — production deployment (launch)

## Architecture

| Layer | URL / host | Role |
|-------|------------|------|
| Marketing + legacy dashboard | `https://nodeblink.dev` (GitHub Pages) | Static `index.html`, `dashboard.html` |
| API + Solana Actions + checkout | `https://api.nodeblink.dev` → **165.245.222.21** | Next.js `:3000` + Express `:8080` |
| Database | Supabase **ap-northeast-2** | PostgreSQL via Session pooler |

## 1. Supabase (ap-northeast-2)

From Supabase → **Project Settings → Database → Connection string**:

**Runtime on DigitalOcean (Session pooler, IPv4):**

```txt
DATABASE_URL=postgresql://postgres.ozthlvybyerymvyytknx:YOUR_PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true
```

**Migrations (direct):**

```txt
DIRECT_URL=postgresql://postgres:YOUR_PASSWORD@db.ozthlvybyerymvyytknx.supabase.co:5432/postgres
```

Apply schema (pick one):

**Option A — Supabase SQL Editor (works from any network):**

1. Open Supabase → **SQL** → New query  
2. Paste contents of `scripts/supabase-init.sql` → Run  
3. On the droplet: `npm run prisma:seed`

**Option B — from the droplet (if `DIRECT_URL` is reachable):**

```bash
npx prisma migrate deploy
npm run prisma:seed
```

## 2. DigitalOcean droplet (165.245.222.21)

```bash
# On the server
git clone https://github.com/EraycanMerih/nodeblink-platform.git /opt/nodeblink/repo
cd /opt/nodeblink/repo
git checkout main
cp .env.example .env   # fill secrets — see SECURITY.md
bash scripts/setup-droplet.sh
```

Nginx: copy `nginx/nodeblink.conf.template` → `/etc/nginx/sites-available/nodeblink`, enable site, then:

```bash
sudo certbot --nginx -d api.nodeblink.dev
```

**Health checks**

- `https://api.nodeblink.dev/api/health` — Next.js + database
- `http://127.0.0.1:8080/api/health` — Express (on server)

## 3. GitHub Pages (nodeblink.dev)

Merge to `main` → workflow publishes `_site/` to `gh-pages`.

GitHub → **Settings → Pages** → branch `gh-pages`, folder `/`.

`config.js` points the dashboard at `https://api.nodeblink.dev`.

## 4. DNS

| Name | Type | Value |
|------|------|--------|
| `nodeblink.dev` | CNAME/A | GitHub Pages |
| `api.nodeblink.dev` | A | `165.245.222.21` |

## 5. Pre-launch verification

```bash
npm run production:check
npm run build
curl https://api.nodeblink.dev/api/health
curl https://api.nodeblink.dev/actions.json
curl https://nodeblink.dev/
```

## Creator surfaces

| URL | Use |
|-----|-----|
| `https://nodeblink.dev` | Marketing |
| `https://nodeblink.dev/dashboard.html` | Legacy blink dashboard (Express API) |
| `https://api.nodeblink.dev/dashboard` | Creator Studio (Next.js + Supabase) |
| `https://api.nodeblink.dev/creator/demo` | Solana Actions checkout demo |
