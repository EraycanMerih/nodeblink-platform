# Security

## Never commit

- `.env`, `.env.local`, or any file containing API keys, database passwords, or encryption keys
- `uploads/`, `data/store.json`, or database files under `prisma/`

This repository is safe to publish: only `.env.example` with placeholders is tracked.

## If a secret was exposed

1. **Supabase** — reset the database password in the Supabase dashboard and update the droplet `.env`.
2. **Alchemy** — rotate the RPC key in Alchemy and update `SOLANA_RPC_URL` on the droplet.
3. **NODEBLINK_ENC_KEY** — generate a new 32-byte base64 key; re-encrypt or re-upload gated assets.

## Production checklist

- [ ] `TREASURY_WALLET` set to your protocol pubkey (not the system program)
- [ ] `CORS_ORIGINS` includes only your real front-end origins
- [ ] HTTPS on `api.nodeblink.dev` (Certbot + nginx)
- [ ] `ADMIN_SECRET` and `DOWNLOAD_SECRET` are long random strings
