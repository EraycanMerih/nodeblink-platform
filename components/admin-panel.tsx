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
  platformFeeBps: number;
  featured: boolean;
  totalVolumeProcessed: string;
  totalTransactions: number;
  createdAt: string;
};

type CreatorsPayload = { items: CreatorRow[] };

type VerificationRequestRow = {
  id: string;
  platform: string;
  handle: string;
  followerCount: number | null;
  proofType: string;
  proofUrl: string;
  code: string;
  requestedFeeBps: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNotes: string | null;
  createdAt: string;
  creatorProfile: {
    id: string;
    username: string;
    displayName: string;
    publicKey: string;
    platformFeeBps: number;
    featured: boolean;
  };
};

type VerificationPayload = { items: VerificationRequestRow[] };

export function AdminPanel() {
  const { publicKey } = useWallet();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [creators, setCreators] = useState<CreatorRow[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequestRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateUsername, setUpdateUsername] = useState("");
  const [updateFeePercent, setUpdateFeePercent] = useState("2.0");
  const [updateFeatured, setUpdateFeatured] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!publicKey) {
        setOverview(null);
        setCreators([]);
        setVerificationRequests([]);
        setError(null);
        setMessage(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const wallet = encodeURIComponent(publicKey.toBase58());
        const [overviewRes, creatorsRes, requestsRes] = await Promise.all([
          fetch(`/api/v1/admin/overview?wallet=${wallet}`),
          fetch(`/api/v1/admin/creators?wallet=${wallet}`),
          fetch(`/api/v1/admin/verification-requests?wallet=${wallet}`),
        ]);
        const overviewJson = (await overviewRes.json()) as Overview & { error?: string };
        if (!overviewRes.ok) throw new Error(overviewJson.error ?? "Admin unavailable");
        const creatorsJson = (await creatorsRes.json()) as CreatorsPayload & { error?: string };
        if (!creatorsRes.ok) throw new Error(creatorsJson.error ?? "Admin unavailable");
        const requestsJson = (await requestsRes.json()) as VerificationPayload & { error?: string };
        if (!requestsRes.ok) throw new Error(requestsJson.error ?? "Admin unavailable");
        setOverview(overviewJson);
        setCreators(creatorsJson.items);
        setVerificationRequests(requestsJson.items);
      } catch (e) {
        setOverview(null);
        setCreators([]);
        setVerificationRequests([]);
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
          The first wallet to connect becomes the admin (unless <code>ADMIN_WALLETS</code> is set).
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
          <section className="panel stack" style={{ padding: 24 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Big creator settings</h2>
            {message ? (
              <p className={message.type === "ok" ? "notice notice-ok" : "notice notice-err"} role="status">
                {message.text}
              </p>
            ) : null}
            <div className="grid-2" style={{ alignItems: "end" }}>
              <label className="field">
                <span>Creator username</span>
                <input
                  className="input"
                  placeholder="e.g. demo"
                  value={updateUsername}
                  onChange={(e) => setUpdateUsername(e.target.value)}
                />
              </label>
              <label className="field">
                <span>Protocol fee (%)</span>
                <input
                  className="input"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={updateFeePercent}
                  onChange={(e) => setUpdateFeePercent(e.target.value)}
                />
              </label>
            </div>
            <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={updateFeatured}
                onChange={(e) => setUpdateFeatured(e.target.checked)}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-muted)" }}>Show “Featured creator” badge</span>
            </label>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!publicKey || saving}
              onClick={async () => {
                if (!publicKey) return;
                const username = updateUsername.trim();
                if (!username) {
                  setMessage({ type: "err", text: "Enter a creator username." });
                  return;
                }
                const feePercent = Number(updateFeePercent);
                if (!Number.isFinite(feePercent) || feePercent < 0 || feePercent > 100) {
                  setMessage({ type: "err", text: "Enter a valid protocol fee percent." });
                  return;
                }
                setSaving(true);
                setMessage(null);
                try {
                  const response = await fetch("/api/v1/admin/creators", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      wallet: publicKey.toBase58(),
                      username,
                      platformFeeBps: Math.round(feePercent * 100),
                      featured: updateFeatured,
                    }),
                  });
                  const payload = (await response.json()) as { ok?: boolean; error?: unknown };
                  if (!response.ok) {
                    throw new Error(typeof payload.error === "string" ? payload.error : "Update failed");
                  }
                  setMessage({ type: "ok", text: "Creator updated." });
                  const wallet = encodeURIComponent(publicKey.toBase58());
                  const creatorsRes = await fetch(`/api/v1/admin/creators?wallet=${wallet}`);
                  const creatorsJson = (await creatorsRes.json()) as CreatorsPayload & { error?: string };
                  if (creatorsRes.ok) {
                    setCreators(creatorsJson.items);
                  }
                } catch (e) {
                  setMessage({ type: "err", text: e instanceof Error ? e.message : "Update failed" });
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : "Save"}
            </button>
          </section>

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
                        Fee {(c.platformFeeBps / 100).toFixed(1)}%{c.featured ? " · Featured" : ""}
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

          <section className="card stack" style={{ padding: 22 }}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Verification requests</h2>
            {verificationRequests.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>
                No requests yet.
              </p>
            ) : (
              <div className="stack" style={{ gap: 10 }}>
                {verificationRequests.map((req) => (
                  <div key={req.id} className="product-row" style={{ alignItems: "start" }}>
                    <div style={{ maxWidth: 760 }}>
                      <strong>
                        @{req.creatorProfile.username} · {req.platform} · {req.handle}
                      </strong>
                      <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
                        {req.creatorProfile.publicKey.slice(0, 6)}…{req.creatorProfile.publicKey.slice(-4)}
                        {req.followerCount ? ` · ${req.followerCount.toLocaleString()} followers` : ""}
                      </p>
                      <p className="muted" style={{ margin: "4px 0 0", fontSize: 12 }}>
                        Status {req.status.toLowerCase()} · Requested fee {(req.requestedFeeBps / 100).toFixed(1)}%
                      </p>
                      <p className="muted" style={{ margin: "4px 0 0", fontSize: 12 }}>
                        Code <code>{req.code}</code>
                      </p>
                      <a className="muted" href={req.proofUrl} target="_blank" rel="noreferrer">
                        Proof link
                      </a>
                    </div>

                    {req.status === "PENDING" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={!publicKey}
                          onClick={async () => {
                            if (!publicKey) return;
                            try {
                              const response = await fetch("/api/v1/admin/verification-requests", {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  wallet: publicKey.toBase58(),
                                  requestId: req.id,
                                  status: "APPROVED",
                                  featured: true,
                                  platformFeeBps: 150,
                                }),
                              });
                              const payload = (await response.json()) as { error?: unknown };
                              if (!response.ok) {
                                throw new Error(typeof payload.error === "string" ? payload.error : "Approve failed");
                              }
                              const wallet = encodeURIComponent(publicKey.toBase58());
                              const refreshed = await fetch(`/api/v1/admin/verification-requests?wallet=${wallet}`);
                              const json = (await refreshed.json()) as VerificationPayload;
                              if (refreshed.ok) setVerificationRequests(json.items);
                            } catch (e) {
                              setMessage({ type: "err", text: e instanceof Error ? e.message : "Approve failed" });
                            }
                          }}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          disabled={!publicKey}
                          onClick={async () => {
                            if (!publicKey) return;
                            try {
                              const response = await fetch("/api/v1/admin/verification-requests", {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  wallet: publicKey.toBase58(),
                                  requestId: req.id,
                                  status: "REJECTED",
                                }),
                              });
                              const payload = (await response.json()) as { error?: unknown };
                              if (!response.ok) {
                                throw new Error(typeof payload.error === "string" ? payload.error : "Reject failed");
                              }
                              const wallet = encodeURIComponent(publicKey.toBase58());
                              const refreshed = await fetch(`/api/v1/admin/verification-requests?wallet=${wallet}`);
                              const json = (await refreshed.json()) as VerificationPayload;
                              if (refreshed.ok) setVerificationRequests(json.items);
                            } catch (e) {
                              setMessage({ type: "err", text: e instanceof Error ? e.message : "Reject failed" });
                            }
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="badge">{req.status}</span>
                    )}
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
