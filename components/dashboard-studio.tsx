"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Copy, ExternalLink, Loader2, Plus, RefreshCw } from "lucide-react";

type DashboardPayload = {
  onboarded: boolean;
  username?: string;
  displayName?: string;
  checkoutUrl?: string;
  actionUrl?: string;
  metrics: {
    volume: number;
    transactions: number;
    products: number;
    confirmedSales?: number;
  };
  products: Array<{ id: string; title: string; archetype: string; priceMinorUnits: string }>;
  transactions: Array<{ id: string; status: string; grossAmount: string; createdAt: string }>;
};

export function DashboardStudio() {
  const { publicKey } = useWallet();
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [form, setForm] = useState({ username: "", displayName: "", bio: "" });
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!publicKey) {
      setData(null);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `/api/v1/dashboard?wallet=${encodeURIComponent(publicKey.toBase58())}`,
      );
      setData(await response.json());
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    load();
  }, [load]);

  const onboard = async () => {
    if (!publicKey) return;
    setOnboarding(true);
    setMessage(null);
    try {
      const response = await fetch("/api/v1/creators/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          username: form.username,
          displayName: form.displayName,
          bio: form.bio,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Onboarding failed");
      }
      setMessage("Creator profile activated.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Onboarding failed");
    } finally {
      setOnboarding(false);
    }
  };

  const checkoutLink =
    data?.checkoutUrl && typeof window !== "undefined"
      ? `${window.location.origin}${data.checkoutUrl}`
      : "";

  return (
    <div className="shell stack animate-rise" style={{ padding: "32px 0 64px" }}>
      <div className="stack" style={{ gap: 8 }}>
        <span className="badge">Creator Studio</span>
        <h1 className="display" style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3rem)" }}>
          Your monetization command center
        </h1>
        <p className="muted" style={{ margin: 0, maxWidth: 620, lineHeight: 1.7 }}>
          Connect a wallet, claim your username, and ship checkout links that unfurl natively across social feeds.
        </p>
      </div>

      <div className="card" style={{ padding: 20, maxWidth: 360 }}>
        <WalletMultiButton />
      </div>

      {!publicKey ? (
        <div className="panel" style={{ padding: 28 }}>
          <p className="muted" style={{ margin: 0 }}>Connect Phantom or Solflare to manage your NodeBlink presence.</p>
        </div>
      ) : loading ? (
        <div className="panel" style={{ padding: 28, display: "flex", gap: 10, alignItems: "center" }}>
          <Loader2 className="animate-spin" size={18} /> Loading studio…
        </div>
      ) : data && !data.onboarded ? (
        <div className="panel stack" style={{ padding: 28, maxWidth: 520 }}>
          <h2 style={{ margin: 0 }}>Activate your creator profile</h2>
          <input
            className="product-row"
            placeholder="username"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          />
          <input
            className="product-row"
            placeholder="Display name"
            value={form.displayName}
            onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
          />
          <textarea
            className="product-row"
            placeholder="Bio"
            rows={3}
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          />
          <button type="button" className="btn btn-primary" disabled={onboarding} onClick={onboard}>
            {onboarding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Create profile
          </button>
        </div>
      ) : data?.onboarded ? (
        <>
          <div className="stat-grid">
            <div className="stat"><span className="muted">Volume</span><strong>{data.metrics.volume.toFixed(2)} SOL eq.</strong></div>
            <div className="stat"><span className="muted">Transactions</span><strong>{data.metrics.transactions}</strong></div>
            <div className="stat"><span className="muted">Products</span><strong>{data.metrics.products}</strong></div>
            <div className="stat"><span className="muted">Confirmed</span><strong>{data.metrics.confirmedSales ?? 0}</strong></div>
          </div>

          <div className="panel stack" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <h2 style={{ margin: 0 }}>@{data.username}</h2>
                <p className="muted" style={{ margin: "6px 0 0" }}>{data.displayName}</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={load}>
                  <RefreshCw size={16} /> Refresh
                </button>
                <a href={data.checkoutUrl} className="btn btn-primary" target="_blank" rel="noreferrer">
                  <ExternalLink size={16} /> Open checkout
                </a>
              </div>
            </div>
            <div className="product-row">
              <code style={{ fontSize: 13 }}>{checkoutLink}</code>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigator.clipboard.writeText(checkoutLink)}
              >
                <Copy size={16} /> Copy
              </button>
            </div>
          </div>

          <div className="grid-2" style={{ alignItems: "start" }}>
            <section className="card stack" style={{ padding: 22 }}>
              <h3 style={{ marginTop: 0 }}>Products</h3>
              {data.products.map((product) => (
                <div key={product.id} className="product-row">
                  <div>
                    <strong>{product.title}</strong>
                    <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>{product.archetype}</p>
                  </div>
                </div>
              ))}
            </section>
            <section className="card stack" style={{ padding: 22 }}>
              <h3 style={{ marginTop: 0 }}>Recent payments</h3>
              {data.transactions.length === 0 ? (
                <p className="muted" style={{ margin: 0 }}>No transactions yet. Share your checkout link.</p>
              ) : (
                data.transactions.map((tx) => (
                  <div key={tx.id} className="product-row">
                    <div>
                      <strong>{tx.status}</strong>
                      <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
                        {Number(tx.grossAmount).toFixed(4)} · {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        </>
      ) : null}

      {message ? <p className="muted">{message}</p> : null}
    </div>
  );
}
