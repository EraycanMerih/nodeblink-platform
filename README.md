# NodeBlink

Solana creator checkout — tips, gated PDFs, access passes, and collectibles with native Actions discovery.

## URLs (production)

| URL | What |
|-----|------|
| [nodeblink.dev](https://nodeblink.dev) | Marketing site (GitHub Pages) |
| [api.nodeblink.dev](https://api.nodeblink.dev) | Full app — landing, Creator Studio, checkout, API |
| [api.nodeblink.dev/dashboard](https://api.nodeblink.dev/dashboard) | Creator Studio |
| [api.nodeblink.dev/creator/demo](https://api.nodeblink.dev/creator/demo) | Demo checkout |

## Local development

```bash
cp .env.example .env   # fill in secrets
npm install
npm run dev            # http://localhost:3000
```

## Deploy

- **DigitalOcean** — `bash scripts/setup-droplet.sh` (Next.js on port 3000, nginx proxy)
- **GitHub Pages** — push to `main` updates `static-site/` on `gh-pages`

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Stack

Next.js 15 · Prisma · Supabase PostgreSQL · Solana Actions · Wallet Adapter
