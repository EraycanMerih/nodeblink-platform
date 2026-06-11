"use client";

import { useState } from 'react';
import { BadgeCheck, Loader2, Search, ShieldAlert, Shield } from 'lucide-react';

type TrustResult = {
  wallet: string;
  verified: boolean;
  level: string;
  platform: string | null;
  handle: string | null;
  displayName: string | null;
  verifiedAt: string | null;
};

export function TrustLookup() {
  const [wallet, setWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrustResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookup = async () => {
    if (!wallet.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await fetch(`/api/v1/trust/${encodeURIComponent(wallet.trim())}`);
      const data = await response.json() as TrustResult;
      setResult(data);
    } catch {
      setError('Failed to query Trust Registry.');
    } finally {
      setLoading(false);
    }
  };

  const levelColor: Record<string, string> = {
    UNVERIFIED: 'var(--color-muted)',
    COMMUNITY: '#60a5fa',
    VERIFIED: '#16a34a',
    FEATURED: 'var(--brand-start)',
  };

  return (
    <div className="stack">
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          className="input"
          style={{ flex: 1 }}
          placeholder="Wallet address (Solana or 0x)…"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && lookup()}
        />
        <button type="button" className="btn btn-primary" disabled={loading || !wallet.trim()} onClick={lookup}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Lookup
        </button>
      </div>

      {error && <p className="notice notice-err">{error}</p>}

      {result && (
        <div className="panel stack" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {result.verified ? (
              <BadgeCheck size={22} color={levelColor[result.level] ?? 'var(--brand-start)'} />
            ) : (
              <ShieldAlert size={22} color="var(--color-muted)" />
            )}
            <div>
              <strong style={{ color: levelColor[result.level] ?? 'var(--text)' }}>
                {result.level}
              </strong>
              {result.displayName && (
                <p style={{ margin: '2px 0 0', fontSize: 14 }}>{result.displayName}</p>
              )}
            </div>
          </div>
          {result.platform && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge">{result.platform}</span>
              {result.handle && <span className="badge">{result.handle}</span>}
            </div>
          )}
          <p className="muted" style={{ margin: 0, fontSize: 12, wordBreak: 'break-all' }}>
            {result.wallet}
          </p>
          {result.verifiedAt && (
            <p className="muted" style={{ margin: 0, fontSize: 12 }}>
              Verified {new Date(result.verifiedAt).toLocaleDateString()}
            </p>
          )}
          {!result.verified && (
            <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
              This wallet is not in the Trust Registry. If you are the owner, verify via Creator Studio.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
