# GitHub Actions secrets (one-time setup)

To let GitHub deploy to your droplet automatically, add these **Repository secrets**  
(Settings → Secrets and variables → Actions → New repository secret):

| Secret | Example value |
|--------|----------------|
| `DO_SSH_PRIVATE_KEY` | Full private key for `root@165.245.222.21` |
| `DO_HOST` | `165.245.222.21` |
| `DO_USER` | `root` |
| `DO_SSH_PORT` | `22` (optional) |
| `DO_ENV_FILE` | Base64 of your `.env` file (see below) |

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

Your `.env` on the server must include:

```txt
DATABASE_URL=postgresql://postgres.ozthlvybyerymvyytknx:PASSWORD@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.ozthlvybyerymvyytknx:PASSWORD@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

## Run deploy

Actions → **Deploy to DigitalOcean** → **Run workflow**

Or push to `main` after secrets are set.
