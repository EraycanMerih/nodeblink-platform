# NodeBlink Creator Studio

NodeBlink is a production-ready, non-custodial checkout platform for creators. The repository now contains two runtimes:

- the legacy Express API and static dashboard used by the current production deployment
- a Next.js App Router + Solana Actions scaffold for native `actions.json` discovery and creator checkout flows

## Production layout

| Component | Host |
|-----------|------|
| Static frontend (`index.html`, `dashboard.html`) | **GitHub Pages** → `nodeblink.dev` |
| Express + Next.js API | **DigitalOcean** → `api.nodeblink.dev` (`165.245.222.21`) |
| PostgreSQL | **Supabase** (Session pooler from the droplet) |

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**, **[docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md)**, and **[SECURITY.md](SECURITY.md)**. Secrets live only in `.env` on the server — never in git.

**Supabase region:** `ap-northeast-2` — use `aws-0-ap-northeast-2.pooler.supabase.com` on the droplet.

## What is included

- Premium landing page with enterprise-grade layout and typography
- Wallet-gated creator dashboard with real Phantom/Solflare connectivity
- Live metrics with revenue, clicks, sales, and protocol fees
- Blink creation for digital assets and service actions
- Optional banner image uploads for richer Blink previews
- Real Solana transaction assembly for SOL and USDC
- Persistent storage in `data/store.json`
- Native Solana Actions endpoints for creator checkout
- Mobile deep-link handoff for creator pages
- Prisma schema for users, creator profiles, digital assets, and transactions

## Quick start (Next.js — recommended)

```bash
npm install
docker compose up -d
cp .env.example .env
# Set DATABASE_URL=postgresql://nodeblink:nodeblink@localhost:5432/nodeblink
# Set SOLANA_RPC_URL, TREASURY_WALLET, NODEBLINK_ENC_KEY

npx prisma migrate dev
npm run prisma:seed
npm run dev
```

Open:

- `http://localhost:3000` — marketing site
- `http://localhost:3000/dashboard` — Creator Studio
- `http://localhost:3000/creator/demo` — live checkout demo
- `http://localhost:3000/actions.json` — Solana Actions discovery

## Legacy Express API (optional)

```bash
npm start
```

Open `http://localhost:8080` for the original static dashboard + Express API.

## DigitalOcean backend deployment

The backend runs cleanly on a DigitalOcean Ubuntu Droplet behind Nginx.

1. Create an Ubuntu 24.04 Droplet.
2. Point `api.yourdomain.com` to the Droplet IP.
3. Install `git`, `nginx`, Node.js 20, and `pm2`.
4. Clone this repo on the Droplet.
5. Create a production `.env` or PM2 environment with `PORT=8080`, `PUBLIC_BASE_URL=https://api.yourdomain.com`, `ASSET_BASE_URL=https://api.yourdomain.com`, `SOLANA_RPC_URL`, `TREASURY_WALLET`, `DEFAULT_CREATOR_WALLET`, `USDC_MINT`, `USDC_DECIMALS`, `DOWNLOAD_SECRET`, `ADMIN_SECRET`, and `ADMIN_ENTRY_PATH`.
6. Run `npm install`.
7. Start the backend with `pm2 start server.js --name nodeblink --update-env`.
8. Save PM2 with `pm2 save` and enable startup with `pm2 startup`.
9. Configure Nginx as a reverse proxy from `443` to `localhost:8080`.
10. Enable HTTPS with Certbot.
11. Confirm `https://api.yourdomain.com/api/metrics` returns JSON.

Important DigitalOcean notes:

- `server.js` already respects `PORT`, `PUBLIC_BASE_URL`, and `CORS_ORIGINS`.
- The app now trusts the proxy, which keeps the admin session cookie working correctly behind Nginx.
- Keep `ADMIN_SECRET` and `DOWNLOAD_SECRET` only in the Droplet environment, PM2 config, or systemd unit.

## GitHub Pages deployment

This repository publishes the front end from `public/` to a `gh-pages` branch through GitHub Actions.

1. Push the repo to GitHub.
2. In GitHub, open the repository settings.
3. Go to Pages.
4. Under Source, choose Deploy from a branch.
5. Select the `gh-pages` branch and the `/root` folder.
6. Save the setting and let the `Deploy NodeBlink Pages Branch` workflow run on `main`.
7. Use the live Pages URL for the public landing page and dashboard preview.

Do not choose `main/root` or `main/docs` for this setup. The workflow publishes the `public/` folder into `gh-pages`, and Pages serves it from that branch.

## Project structure

- `index.html` — landing page
- `dashboard.html` — creator dashboard source file
- `app/` — Next.js App Router + Solana Actions scaffold
- `prisma/schema.prisma` — database schema for creators and transactions
- `server.js` — production server with Solana transaction logic
- `data/store.json` — persisted metrics and Blink records
- `uploads/` — digital asset uploads

Clean local routes:

- `/` — landing page
- `/dashboard` — creator dashboard
- `/operations-9b72f1c4d6e8` — hidden admin entry path

## Wallet connectivity

The dashboard connects to real Solana wallets via browser extensions:
- Phantom (`window.solana.isPhantom`)
- Solflare (`window.solflare.isSolflare`)

Users must connect a wallet to access the creator dashboard.

## Core API endpoints

All endpoints are served at `http://localhost:8080/api`.

- `GET /metrics` — aggregated metrics
- `GET /blinks` — list all Blinks
- `POST /blinks` — create a new Blink
- `GET /blink/:id` — Action metadata (increments clicks)
- `POST /blink/:id` — transaction assembly for checkout
- `POST /webhook/solana-confirm` — confirm sales and deliver assets
- `GET /wallet-profiles` — wallet profile list
- `POST /wallet-profiles` — add wallet profile
- `PUT /wallet-profiles/:id` — update wallet profile
- `GET /fees` — protocol fee configuration
- `PUT /fees` — blocked by policy (returns 403, fee is immutable)

## Next.js Actions routes

- `GET /actions.json` — native Actions discovery document
- `GET /api/v1/actions/creator/:username` — creator action metadata
- `POST /api/v1/actions/creator/:username` — creator transaction payload
- `GET /creator/:username` — mobile-friendly creator checkout page

## Environment variables

You can customize deployment with the following environment variables:

- `PUBLIC_BASE_URL` — public base URL (default: `http://localhost:8080`)
- `SOLANA_RPC_URL` — Solana RPC endpoint (default: mainnet-beta)
- `TREASURY_WALLET` — protocol fee wallet address
- `DEFAULT_CREATOR_WALLET` — fallback creator wallet
- `USDC_MINT` — USDC mint address on Solana
- `USDC_DECIMALS` — USDC decimals (default: 6)
- `ASSET_BASE_URL` — asset hosting base URL (default: `PUBLIC_BASE_URL`)
- `DOWNLOAD_SECRET` — HMAC secret for signed downloads
- `ADMIN_SECRET` — admin auth secret
- `CORS_ORIGINS` — comma-separated list of allowed origins

## Production notes

- `server.js` assembles real Solana transactions for SOL and USDC.
- `data/store.json` persists metrics and Blink state across restarts.
- Digital assets are stored in `uploads/` and delivered via signed links.

## Troubleshooting

If the server fails to start:

```bash
rm -rf node_modules package-lock.json
npm install
npm start
```
