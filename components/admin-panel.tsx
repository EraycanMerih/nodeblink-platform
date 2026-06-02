"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2, ShieldAlert } from "lucide-react";

type Overview = {
  creators: number;
  products: number;
  transactions: number;
  volume: number;
};

type CreatorRow = {
  id: string;
  username: string;
  displayName: string;
  publicKey: string;
  totalVolumeProcessed: string;
  totalTransactions: number;
  createdAt: string;
};

type CreatorsPayload = { items: CreatorRow[] };

export function AdminPanel() {
  const { publicKey } = useWallet();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [creators, setCreators] = useState<CreatorRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!publicKey) {
        setOverview(null);
        setCreators([]);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const wallet = encodeURIComponent(publicKey.toBase58());
        const [overviewRes, creatorsRes] = await Promise.all([
          fetch(`/api/v1/admin/overview?wallet=${wallet}`),
          fetch(`/api/v1/admin/creators?wallet=${wallet}`),
        ]);
        const overviewJson = (await overviewRes.json()) as Overview & { error?: string };
        if (!overviewRes.ok) throw new Error(overviewJson.error ?? "Admin unavailable");
        const creatorsJson = (await creatorsRes.json()) as CreatorsPayload & { error?: string };
        if (!creatorsRes.ok) throw new Error(creatorsJson.error ?? "Admin unavailable");
        setOverview(overviewJson);
        setCreators(creatorsJson.items);
      } catch (e) {
        setOverview(null);
        setCreators([]);
        setError(e instanceof Error ? e.message : "Admin unavailable");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [publicKey]);

  return (
    <div className="stack">
      <div className="stack" style={{ gap: 10 }}>
        <span className="badge">Admin</span>
        <h1 className="display" style={{ margin: 0, fontSize: "clamp(1.7rem, 3vw, 2.3rem)" }}>
          Protocol controls
        </h1>
        <p className="muted" style={{ margin: 0, maxWidth: 760, lineHeight: 1.7 }}>
          Read-only protocol overview for operator wallets configured in <code>ADMIN_WALLETS</code>.
        </p>
      </div>

      {!publicKey ? (
        <div className="panel" style={{ padding: 28 }}>
          <p className="muted" style={{ margin: 0 }}>
            Connect a wallet to continue.
          </p>
        </div>
      ) : loading ? (
        <div className="panel" style={{ padding: 28, display: "flex", gap: 10, alignItems: "center" }}>
          <Loader2 className="animate-spin" size={18} /> Loading admin panel…
        </div>
      ) : error ? (
        <div className="panel stack" style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldAlert size={18} />
            <strong>Access denied</strong>
          </div>
          <p className="notice notice-err" role="status">
            {error}
          </p>
        </div>
      ) : overview ? (
        <>
          <div className="stat-grid">
            <div className="stat">
              <span className="muted">Creators</span>
              <strong>{overview.creators}</strong>
            </div>
            <div className="stat">
              <span className="muted">Products</span>
              <strong>{overview.products}</strong>
            </div>
            <div className="stat">
              <span className="muted">Transactions</span>
              <strong>{overview.transactions}</strong>
            </div>
            <div className="stat">
              <span className="muted">Volume (SOL)</span>
              <strong>{overview.volume.toFixed(2)}</strong>
            </div>
          </div>

          <section className="card stack" style={{ padding: 22 }}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Creators</h2>
            {creators.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>
                No creators yet.
              </p>
            ) : (
              <div className="stack" style={{ gap: 10 }}>
                {creators.map((c) => (
                  <div key={c.id} className="product-row" style={{ alignItems: "start" }}>
                    <div>
                      <strong>@{c.username}</strong>
                      <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
                        {c.displayName} · {c.publicKey.slice(0, 6)}…{c.publicKey.slice(-4)}
                      </p>
                      <p className="muted" style={{ margin: "4px 0 0", fontSize: 12 }}>
                        Created {new Date(c.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="badge">
                      {Number(c.totalVolumeProcessed).toFixed(2)} SOL · {c.totalTransactions} tx
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

