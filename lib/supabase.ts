/**
 * Supabase connection helpers for DigitalOcean (IPv4) + ap-northeast-2.
 * Passwords belong in .env only — never in source control.
 */

export const SUPABASE_PROJECT_REF = "ozthlvybyerymvyytknx";
export const SUPABASE_REGION = "ap-northeast-2";

/** Session pooler host (IPv4-compatible from DigitalOcean) */
/** Session pooler host for ap-northeast-2 (use aws-1, not aws-0). */
export const SUPABASE_POOLER_HOST = `aws-1-${SUPABASE_REGION}.pooler.supabase.com`;

/** Direct database host (migrations / Prisma Studio) */
export const SUPABASE_DB_HOST = `db.${SUPABASE_PROJECT_REF}.supabase.co`;

export function buildSupabasePoolerUrl(password: string): string {
  const encoded = encodeURIComponent(password);
  return `postgresql://postgres.${SUPABASE_PROJECT_REF}:${encoded}@${SUPABASE_POOLER_HOST}:5432/postgres?pgbouncer=true`;
}

export function buildSupabaseDirectUrl(password: string): string {
  const encoded = encodeURIComponent(password);
  return `postgresql://postgres:${encoded}@${SUPABASE_DB_HOST}:5432/postgres`;
}
