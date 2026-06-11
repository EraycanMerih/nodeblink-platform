# NodeBlink

Solana creator checkout — tips, gated PDFs, access passes, and collectibles with native Actions discovery.

## URLs (production)

| URL | What |
|-----|------|
| [nodeblink.dev](https://nodeblink.dev) | Full app — landing, Creator Studio, checkout, API |
| [api.nodeblink.dev](https://api.nodeblink.dev) | Domain alias (serves the same app) |
| [nodeblink.dev/dashboard](https://nodeblink.dev/dashboard) | Creator Studio |
| [nodeblink.dev/creator/demo](https://nodeblink.dev/creator/demo) | Demo checkout |

## Local development

```bash
cp .env.example .env   # fill in secrets
npm install
npm run dev            # http://localhost:3000
```

## Deploy

- **DigitalOcean** — `bash scripts/setup-droplet.sh` (Next.js on port 3001, nginx proxy)

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Stack

Next.js 15 · Prisma · Supabase PostgreSQL · Solana Actions · Wallet Adapter
