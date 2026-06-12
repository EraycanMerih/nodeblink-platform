# NodeBlink

**Open-Source, Non-Custodial Creator Routing Protocol**

NodeBlink provides seamless checkout widgets for creators on Solana and Fiat (Stripe). We do not custody funds. Payments route directly from buyer to creator.

## Features
- **Non-Custodial Routing:** No central treasury risk. Creators connect their own Stripe Express or Solana wallets.
- **Custom Domain Resilience:** Map your own domains (e.g. `pay.creator.com`) so your checkout is never subject to platform-wide bans.
- **Player Cards:** Embed natively in Twitter/X with seamless UI.
- **Multi-Currency:** Support for SOL, USDC, and Fiat.

## Getting Started

1. Clone the repository.
2. Run `cp .env.example .env` and fill in your keys.
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`

## Legal & Security
This frontend contains zero hardcoded secrets and relies heavily on environmental variables for infrastructure bindings. It acts purely as a routing intermediary between buyers, Stripe Connect, and the Solana blockchain.

## Deploy
See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for DigitalOcean instructions.

## Stack
Next.js 15 · Prisma · Supabase PostgreSQL · Solana Actions · Stripe Connect
