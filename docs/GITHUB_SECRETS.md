# GitHub Actions secrets (one-time setup)

To let GitHub deploy to your droplet automatically, add these **Repository secrets**  
(Settings → Secrets and variables → Actions → New repository secret):

| Secret | Example value |
|--------|----------------|
| `DO_SSH_PRIVATE_KEY` | Full private key for `deploy@165.245.222.21` (or `root@...`) |
| `DO_HOST` | `165.245.222.21` |
| `DO_USER` | `deploy` (recommended) or `root` |
| `DO_SSH_PORT` | `22` (optional) |
| `DO_ENV_FILE` | Base64 of your `.env` file (see below) |
| `NODEBLINK_DOMAINS` | `nodeblink.dev www.nodeblink.dev api.nodeblink.dev` (optional) |
| `CERTBOT_EMAIL` | Email used by Let's Encrypt for SSL cert issuance (optional) |

If you use `DO_USER=deploy`, the user must have **passwordless sudo** (so the workflow can install system packages and configure nginx/SSL).

## Create `DO_ENV_FILE`

On your machine (with a filled `.env` using **aws-1** pooler):

**Linux/macOS:**

```bash
base64 -w0 .env
```

**Windows PowerShell:**

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes(".env"))
```

Paste the output as the `DO_ENV_FILE` secret.

If `DO_ENV_FILE` is not set, the deploy workflow expects `.env` to already exist on the droplet at:

`/opt/nodeblink/repo/.env`

Your `.env` on the server must include:

```txt
DATABASE_URL=postgresql://postgres.ozthlvybyerymvyytknx:PASSWORD@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.ozthlvybyerymvyytknx:PASSWORD@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

## Run deploy

Actions → **Deploy to DigitalOcean** → **Run workflow**

Or push to `main` after secrets are set.
