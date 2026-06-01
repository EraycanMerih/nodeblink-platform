"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Copy,
  ExternalLink,
  FileUp,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

type ProductArchetype = "TIP" | "UNLOCK_DOCUMENT" | "ACCESS_PASS" | "MINT_NFT";

type DashboardProduct = {
  id: string;
  title: string;
  archetype: string;
  priceMinorUnits: string;
  description?: string | null;
};

type DashboardPayload = {
  onboarded: boolean;
  username?: string;
  displayName?: string;
  bio?: string | null;
  checkoutUrl?: string;
  actionUrl?: string;
  metrics: {
    volume: number;
    transactions: number;
    products: number;
    confirmedSales?: number;
  };
  products: DashboardProduct[];
  transactions: Array<{ id: string; status: string; grossAmount: string; createdAt: string }>;
};

const PRODUCT_TYPES: Array<{
  id: ProductArchetype;
  label: string;
  hint: string;
}> = [
  {
    id: "TIP",
    label: "Tip jar",
    hint: "Let fans send SOL with one click.",
  },
  {
    id: "UNLOCK_DOCUMENT",
    label: "Gated PDF",
    hint: "Upload a file buyers unlock after paying.",
  },
  {
    id: "ACCESS_PASS",
    label: "Access pass",
    hint: "Sell community or membership access.",
  },
  {
    id: "MINT_NFT",
    label: "Collectible",
    hint: "Sell a mint-style digital pass.",
  },
];

function lamportsToSol(lamports: string): number {
  return Number(lamports) / 1_000_000_000;
}

function formatArchetype(value: string) {
  return value.replace(/_/g, " ").toLowerCase();
}

export function DashboardStudio() {
  const { publicKey } = useWallet();
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [form, setForm] = useState({ username: "", displayName: "", bio: "" });
  const [profileForm, setProfileForm] = useState({ displayName: "", bio: "" });
  const [productForm, setProductForm] = useState({
    archetype: "TIP" as ProductArchetype,
    title: "",
    description: "",
    priceSol: "0.25",
    accessTerm: "monthly",
    mintName: "",
    symbol: "",
    file: null as File | null,
  });
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

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
      const payload = (await response.json()) as DashboardPayload;
      setData(payload);
      if (payload.onboarded) {
        setProfileForm({
          displayName: payload.displayName ?? "",
          bio: payload.bio ?? "",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    load();
  }, [load]);

  const checkoutLink = useMemo(() => {
    if (!data?.checkoutUrl || typeof window === "undefined") return "";
    return `${window.location.origin}${data.checkoutUrl}`;
  }, [data?.checkoutUrl]);

  const notify = (type: "ok" | "err", text: string) => setMessage({ type, text });

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
      notify("ok", "Your creator profile is live. Add your first product below.");
      await load();
    } catch (error) {
      notify("err", error instanceof Error ? error.message : "Onboarding failed");
    } finally {
      setOnboarding(false);
    }
  };

  const saveProfile = async () => {
    if (!publicKey) return;
    try {
      const response = await fetch("/api/v1/creators/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          displayName: profileForm.displayName,
          bio: profileForm.bio,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Save failed");
      notify("ok", "Profile updated.");
      await load();
    } catch (error) {
      notify("err", error instanceof Error ? error.message : "Save failed");
    }
  };

  const readFileBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1] ?? "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const createProduct = async () => {
    if (!publicKey || !data?.username) return;
    if (!productForm.title.trim()) {
      notify("err", "Give your product a title.");
      return;
    }

    const priceSol = Number(productForm.priceSol);
    if (!Number.isFinite(priceSol) || priceSol <= 0) {
      notify("err", "Enter a valid price in SOL.");
      return;
    }

    setSavingProduct(true);
    setMessage(null);

    try {
      if (productForm.archetype === "UNLOCK_DOCUMENT") {
        if (!productForm.file) {
          throw new Error("Choose a PDF or file to sell.");
        }
        const base64Data = await readFileBase64(productForm.file);
        const response = await fetch("/api/v1/assets/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: publicKey.toBase58(),
            creatorUsername: data.username,
            filename: productForm.file.name,
            base64Data,
            title: productForm.title,
            priceSol,
          }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Upload failed");
      } else {
        const response = await fetch("/api/v1/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: publicKey.toBase58(),
            archetype: productForm.archetype,
            title: productForm.title,
            description: productForm.description || undefined,
            priceSol,
            accessTerm:
              productForm.archetype === "ACCESS_PASS"
                ? productForm.accessTerm
                : undefined,
            mintName:
              productForm.archetype === "MINT_NFT"
                ? productForm.mintName || productForm.title
                : undefined,
            symbol:
              productForm.archetype === "MINT_NFT"
                ? productForm.symbol || "PASS"
                : undefined,
          }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Create failed");
      }

      setProductForm((f) => ({
        ...f,
        title: "",
        description: "",
        file: null,
      }));
      notify("ok", "Product added to your checkout page.");
      await load();
    } catch (error) {
      notify("err", error instanceof Error ? error.message : "Could not create product");
    } finally {
      setSavingProduct(false);
    }
  };

  const removeProduct = async (id: string) => {
    if (!publicKey) return;
    try {
      const response = await fetch(
        `/api/v1/products/${id}?wallet=${encodeURIComponent(publicKey.toBase58())}`,
        { method: "DELETE" },
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Remove failed");
      notify("ok", "Product removed from checkout.");
      await load();
    } catch (error) {
      notify("err", error instanceof Error ? error.message : "Remove failed");
    }
  };

  return (
    <div className="shell stack animate-rise" style={{ padding: "32px 0 64px" }}>
      <div className="stack" style={{ gap: 10 }}>
        <span className="badge">Creator Studio</span>
        <h1 className="display" style={{ margin: 0, fontSize: "clamp(1.9rem, 4vw, 2.6rem)" }}>
          Set up checkout in minutes
        </h1>
        <p className="muted" style={{ margin: 0, maxWidth: 640, lineHeight: 1.7 }}>
          Connect your wallet, claim a username, add products, and share one link. Buyers pay on
          Solana; files and access unlock automatically.
        </p>
      </div>

      <div className="card" style={{ padding: 20, maxWidth: 380 }}>
        <WalletMultiButton />
      </div>

      {message ? (
        <p
          className={message.type === "ok" ? "notice notice-ok" : "notice notice-err"}
          role="status"
        >
          {message.text}
        </p>
      ) : null}

      {!publicKey ? (
        <div className="panel" style={{ padding: 28 }}>
          <p className="muted" style={{ margin: 0 }}>
            Connect Phantom or Solflare to open your studio.
          </p>
        </div>
      ) : loading ? (
        <div className="panel" style={{ padding: 28, display: "flex", gap: 10, alignItems: "center" }}>
          <Loader2 className="animate-spin" size={18} /> Loading…
        </div>
      ) : data && !data.onboarded ? (
        <div className="panel stack" style={{ padding: 28, maxWidth: 520 }}>
          <h2 style={{ margin: 0 }}>Step 1 — Create your profile</h2>
          <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>
            Pick a username for your public checkout URL.
          </p>
          <label className="field">
            <span>Username</span>
            <input
              className="input"
              placeholder="yourname"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase() }))}
            />
          </label>
          <label className="field">
            <span>Display name</span>
            <input
              className="input"
              placeholder="Your brand or name"
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
            />
          </label>
          <label className="field">
            <span>Bio (optional)</span>
            <textarea
              className="input"
              rows={3}
              placeholder="What do you sell?"
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            />
          </label>
          <button type="button" className="btn btn-primary" disabled={onboarding} onClick={onboard}>
            {onboarding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Create profile
          </button>
        </div>
      ) : data?.onboarded ? (
        <>
          <div className="stat-grid">
            <div className="stat">
              <span className="muted">Volume</span>
              <strong>{data.metrics.volume.toFixed(2)} SOL</strong>
            </div>
            <div className="stat">
              <span className="muted">Payments</span>
              <strong>{data.metrics.transactions}</strong>
            </div>
            <div className="stat">
              <span className="muted">Products</span>
              <strong>{data.metrics.products}</strong>
            </div>
            <div className="stat">
              <span className="muted">Confirmed</span>
              <strong>{data.metrics.confirmedSales ?? 0}</strong>
            </div>
          </div>

          <div className="panel stack" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <h2 style={{ margin: 0 }}>@{data.username}</h2>
                <p className="muted" style={{ margin: "6px 0 0" }}>{data.displayName}</p>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" className="btn btn-secondary" onClick={load}>
                  <RefreshCw size={16} /> Refresh
                </button>
                <a href={data.checkoutUrl} className="btn btn-primary" target="_blank" rel="noreferrer">
                  <ExternalLink size={16} /> Preview checkout
                </a>
              </div>
            </div>
            <div className="product-row">
              <code style={{ fontSize: 13, wordBreak: "break-all" }}>{checkoutLink}</code>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  navigator.clipboard.writeText(checkoutLink);
                  notify("ok", "Checkout link copied.");
                }}
              >
                <Copy size={16} /> Copy link
              </button>
            </div>
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>
              Share this link anywhere. Wallets unfurl pay buttons from your Solana Actions feed.
            </p>
          </div>

          <div className="grid-2" style={{ alignItems: "start" }}>
            <section className="panel stack" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Package size={20} color="#02a8b5" />
                <h2 style={{ margin: 0, fontSize: 22 }}>Step 2 — Add a product</h2>
              </div>
              <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>
                Choose a type, set a price, and publish to your checkout page instantly.
              </p>

              <div className="type-grid">
                {PRODUCT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    className={`type-card${productForm.archetype === type.id ? " type-card-active" : ""}`}
                    onClick={() => setProductForm((f) => ({ ...f, archetype: type.id }))}
                  >
                    <strong>{type.label}</strong>
                    <span>{type.hint}</span>
                  </button>
                ))}
              </div>

              <label className="field">
                <span>Title</span>
                <input
                  className="input"
                  placeholder={
                    productForm.archetype === "UNLOCK_DOCUMENT"
                      ? "e.g. Strategy playbook"
                      : "e.g. Monthly community access"
                  }
                  value={productForm.title}
                  onChange={(e) => setProductForm((f) => ({ ...f, title: e.target.value }))}
                />
              </label>

              <label className="field">
                <span>Description (optional)</span>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="What does the buyer get?"
                  value={productForm.description}
                  onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))}
                />
              </label>

              <label className="field">
                <span>Price (SOL)</span>
                <input
                  className="input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={productForm.priceSol}
                  onChange={(e) => setProductForm((f) => ({ ...f, priceSol: e.target.value }))}
                />
              </label>

              {productForm.archetype === "UNLOCK_DOCUMENT" ? (
                <label className="field">
                  <span>PDF or file</span>
                  <div className="file-drop">
                    <FileUp size={18} />
                    <input
                      type="file"
                      accept=".pdf,.zip,.epub,application/pdf"
                      onChange={(e) =>
                        setProductForm((f) => ({
                          ...f,
                          file: e.target.files?.[0] ?? null,
                        }))
                      }
                    />
                    <span>
                      {productForm.file
                        ? productForm.file.name
                        : "Click to choose a file (max 25 MB)"}
                    </span>
                  </div>
                </label>
              ) : null}

              {productForm.archetype === "ACCESS_PASS" ? (
                <label className="field">
                  <span>Access term</span>
                  <select
                    className="input"
                    value={productForm.accessTerm}
                    onChange={(e) =>
                      setProductForm((f) => ({ ...f, accessTerm: e.target.value }))
                    }
                  >
                    <option value="monthly">Monthly</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </label>
              ) : null}

              {productForm.archetype === "MINT_NFT" ? (
                <div className="grid-2">
                  <label className="field">
                    <span>Collection name</span>
                    <input
                      className="input"
                      placeholder="Creator Pass"
                      value={productForm.mintName}
                      onChange={(e) =>
                        setProductForm((f) => ({ ...f, mintName: e.target.value }))
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Symbol</span>
                    <input
                      className="input"
                      placeholder="PASS"
                      maxLength={12}
                      value={productForm.symbol}
                      onChange={(e) =>
                        setProductForm((f) => ({ ...f, symbol: e.target.value.toUpperCase() }))
                      }
                    />
                  </label>
                </div>
              ) : null}

              <button
                type="button"
                className="btn btn-primary"
                disabled={savingProduct}
                onClick={createProduct}
              >
                {savingProduct ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                Publish to checkout
              </button>
            </section>

            <div className="stack">
              <section className="card stack" style={{ padding: 22 }}>
                <h3 style={{ marginTop: 0 }}>Your products</h3>
                {data.products.length === 0 ? (
                  <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>
                    No products yet. Add a tip jar or upload a PDF to get started.
                  </p>
                ) : (
                  data.products.map((product) => (
                    <div key={product.id} className="product-row">
                      <div>
                        <strong>{product.title}</strong>
                        <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
                          {formatArchetype(product.archetype)} ·{" "}
                          {lamportsToSol(product.priceMinorUnits).toFixed(2)} SOL
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        aria-label={`Remove ${product.title}`}
                        onClick={() => removeProduct(product.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </section>

              <section className="card stack" style={{ padding: 22 }}>
                <h3 style={{ marginTop: 0 }}>Recent payments</h3>
                {data.transactions.length === 0 ? (
                  <p className="muted" style={{ margin: 0 }}>
                    No payments yet. Share your checkout link to start earning.
                  </p>
                ) : (
                  data.transactions.map((tx) => (
                    <div key={tx.id} className="product-row">
                      <div>
                        <strong>{tx.status}</strong>
                        <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
                          {Number(tx.grossAmount).toFixed(4)} SOL ·{" "}
                          {new Date(tx.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </section>

              <section className="card stack" style={{ padding: 22 }}>
                <h3 style={{ marginTop: 0 }}>Profile</h3>
                <label className="field">
                  <span>Display name</span>
                  <input
                    className="input"
                    value={profileForm.displayName}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, displayName: e.target.value }))
                    }
                  />
                </label>
                <label className="field">
                  <span>Bio</span>
                  <textarea
                    className="input"
                    rows={2}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm((f) => ({ ...f, bio: e.target.value }))}
                  />
                </label>
                <button type="button" className="btn btn-secondary" onClick={saveProfile}>
                  Save profile
                </button>
              </section>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
