# Launch checklist

## Secrets (droplet `.env` only)

- [ ] `DATABASE_URL` — `aws-0-ap-northeast-2.pooler.supabase.com`
- [ ] `DIRECT_URL` — `db.ozthlvybyerymvyytknx.supabase.co`
- [ ] `SOLANA_RPC_URL` — Alchemy mainnet key
- [ ] `NODEBLINK_ENC_KEY` — 32-byte base64 AES key
- [ ] `TREASURY_WALLET` — `2bmt3ePtcnMM3asV8Ecip5oHMgn6n7HohtndsCGkVMy1`
- [ ] `DOWNLOAD_SECRET` — long random string (not placeholder)
- [ ] `ADMIN_SECRET` — long random string (not placeholder)
- [ ] `CORS_ORIGINS` — `https://nodeblink.dev` + your `*.github.io` URL

## Infrastructure

- [ ] DNS `api.nodeblink.dev` → `165.245.222.21`
- [ ] HTTPS on api (Certbot)
- [ ] `npx prisma migrate deploy` succeeded
- [ ] `npm run prisma:seed` created `@demo` creator
- [ ] PM2: `nodeblink-next` + `nodeblink-api` running
- [ ] GitHub Pages on `nodeblink.dev` from `gh-pages` branch

## Smoke tests

- [ ] `GET https://api.nodeblink.dev/api/health` → `"database":"ok"`
- [ ] `GET https://api.nodeblink.dev/actions.json`
- [ ] `GET https://api.nodeblink.dev/creator/demo` loads checkout
- [ ] `https://nodeblink.dev` loads marketing site
- [ ] Dashboard on Pages connects to API (create blink test)

## Security

- [ ] No `.env` in git (`git ls-files .env` is empty)
- [ ] Supabase password rotated if it was ever shared in chat
- [ ] Alchemy key rotated if exposed
