"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2, TrendingUp } from "lucide-react";

type SeriesPoint = { date: string; volume: number; count: number };

type Payload = {
  windowDays: number;
  series: SeriesPoint[];
  totals: { volume: number; count: number };
  statusBreakdown: Record<string, number>;
  topProducts: Array<{ productId: string | null; volume: number; count: number }>;
};

type ProductOption = { id: string; title: string };

function formatDateLabel(isoDate: string) {
  const [y, m, d] = isoDate.split("-");
  return `${m}/${d}`;
}

function sparkPoints(values: number[], width = 420, height = 120) {
  if (values.length === 0) return "";
  const max = Math.max(...values, 0.000001);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export function DashboardAnalytics() {
  const { publicKey } = useWallet();
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      if (!publicKey) {
        setData(null);
        setError(null);
        setProducts([]);
        setSelectedProductId("");
        return;
      }
      setError(null);
      try {
        const response = await fetch(
          `/api/v1/dashboard?wallet=${encodeURIComponent(publicKey.toBase58())}`,
        );
        const payload = (await response.json()) as { products?: ProductOption[]; error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Analytics unavailable");
        setProducts(payload.products ?? []);
      } catch (e) {
        setProducts([]);
      }
    };
    run();
  }, [publicKey]);

  useEffect(() => {
    const run = async () => {
      if (!publicKey) return;
      setLoading(true);
      setError(null);
      try {
        const url = new URL("/api/v1/dashboard/analytics", window.location.origin);
        url.searchParams.set("wallet", publicKey.toBase58());
        if (selectedProductId) url.searchParams.set("productId", selectedProductId);
        const response = await fetch(
          url.toString(),
        );
        const payload = (await response.json()) as Payload & { error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Analytics unavailable");
        setData(payload);
      } catch (e) {
        setData(null);
        setError(e instanceof Error ? e.message : "Analytics unavailable");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [publicKey, selectedProductId]);

  const productMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) map.set(p.id, p.title);
    return map;
  }, [products]);

  const volumePoints = useMemo(() => {
    if (!data) return "";
    return sparkPoints(data.series.map((p) => p.volume));
  }, [data]);

  const countPoints = useMemo(() => {
    if (!data) return "";
    return sparkPoints(data.series.map((p) => p.count));
  }, [data]);

  return (
    <div className="stack">
      <div className="stack" style={{ gap: 10 }}>
        <span className="badge">Analytics</span>
        <h1 className="display" style={{ margin: 0, fontSize: "clamp(1.7rem, 3vw, 2.3rem)" }}>
          Performance snapshot
        </h1>
        <p className="muted" style={{ margin: 0, maxWidth: 720, lineHeight: 1.7 }}>
          View recent sales activity and trends from confirmed payments on your creator link.
        </p>
        {publicKey ? (
          <label className="field" style={{ maxWidth: 420 }}>
            <span>Product</span>
            <select
              className="input"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">All products</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.title}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {!publicKey ? (
        <div className="panel" style={{ padding: 28 }}>
          <p className="muted" style={{ margin: 0 }}>
            Connect a wallet to view analytics.
          </p>
        </div>
      ) : loading ? (
        <div className="panel" style={{ padding: 28, display: "flex", gap: 10, alignItems: "center" }}>
          <Loader2 className="animate-spin" size={18} /> Loading analytics…
        </div>
      ) : error ? (
        <div className="panel" style={{ padding: 28 }}>
          <p className="notice notice-err" role="status">
            {error}
          </p>
        </div>
      ) : data ? (
        <>
          <div className="stat-grid">
            <div className="stat">
              <span className="muted">Window</span>
              <strong>{data.windowDays} days</strong>
            </div>
            <div className="stat">
              <span className="muted">Confirmed volume</span>
              <strong>{data.totals.volume.toFixed(2)} SOL</strong>
            </div>
            <div className="stat">
              <span className="muted">Confirmed payments</span>
              <strong>{data.totals.count}</strong>
            </div>
            <div className="stat">
              <span className="muted">Trend</span>
              <strong style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <TrendingUp size={18} /> Live
              </strong>
            </div>
          </div>

          <div className="grid-2" style={{ alignItems: "start" }}>
            <section className="panel stack" style={{ padding: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Volume (SOL)</h2>
              <svg viewBox="0 0 420 120" width="100%" height="140" aria-label="Volume sparkline">
                <polyline
                  points={volumePoints}
                  fill="none"
                  stroke="var(--brand-start)"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <span className="muted" style={{ fontSize: 12 }}>
                  {data.series.length ? formatDateLabel(data.series[0].date) : "-"}
                </span>
                <span className="muted" style={{ fontSize: 12 }}>
                  {data.series.length
                    ? formatDateLabel(data.series[data.series.length - 1].date)
                    : "-"}
                </span>
              </div>
            </section>

            <section className="panel stack" style={{ padding: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Payments</h2>
              <svg viewBox="0 0 420 120" width="100%" height="140" aria-label="Payments sparkline">
                <polyline
                  points={countPoints}
                  fill="none"
                  stroke="var(--brand-end)"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <span className="muted" style={{ fontSize: 12 }}>
                  {data.series.length ? formatDateLabel(data.series[0].date) : "-"}
                </span>
                <span className="muted" style={{ fontSize: 12 }}>
                  {data.series.length
                    ? formatDateLabel(data.series[data.series.length - 1].date)
                    : "-"}
                </span>
              </div>
            </section>
          </div>

          <div className="grid-2" style={{ alignItems: "start" }}>
            <section className="card stack" style={{ padding: 22 }}>
              <h3 style={{ marginTop: 0 }}>Status breakdown</h3>
              <div className="stack" style={{ gap: 10 }}>
                {Object.entries(data.statusBreakdown).map(([status, value]) => (
                  <div key={status} className="product-row">
                    <strong style={{ textTransform: "capitalize" }}>{status.toLowerCase()}</strong>
                    <span className="badge">{value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="card stack" style={{ padding: 22 }}>
              <h3 style={{ marginTop: 0 }}>Top products</h3>
              {data.topProducts.length === 0 ? (
                <p className="muted" style={{ margin: 0 }}>
                  No confirmed payments yet.
                </p>
              ) : (
                <div className="stack" style={{ gap: 10 }}>
                  {data.topProducts.map((p) => (
                    <div key={p.productId ?? "unknown"} className="product-row">
                      <div>
                        <strong>
                          {p.productId
                            ? productMap.get(p.productId) ?? p.productId.slice(0, 8)
                            : "Unknown product"}
                        </strong>
                        <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
                          {p.count} payments
                        </p>
                      </div>
                      <span className="badge">{p.volume.toFixed(2)} SOL</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
