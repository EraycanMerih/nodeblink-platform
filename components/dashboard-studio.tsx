"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import {
  Copy,
  ExternalLink,
  FileUp,
  ImagePlus,
  Link2,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Trash2,
  CreditCard,
  LayoutGrid,
  Settings,
  BarChart3,
  Check,
} from "lucide-react";

type ProductArchetype = "TIP" | "UNLOCK_DOCUMENT" | "ACCESS_PASS" | "MINT_NFT";

type DashboardProduct = {
  id: string;
  title: string;
  archetype: string;
  priceMinorUnits: string;
  currency: string;
  description?: string | null;
  imageUrl?: string | null;
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

const PRODUCT_TYPES = [
  { id: "TIP" as ProductArchetype, label: "Tip jar", hint: "Let fans send crypto or card." },
  { id: "UNLOCK_DOCUMENT" as ProductArchetype, label: "Gated File", hint: "Upload a file buyers unlock after paying." },
  { id: "ACCESS_PASS" as ProductArchetype, label: "Access pass", hint: "Sell community or membership access." },
  { id: "MINT_NFT" as ProductArchetype, label: "Collectible", hint: "Sell a mint-style digital pass." },
];

function lamportsToSol(lamports: string): number {
  return Number(lamports) / 1_000_000_000;
}

function formatArchetype(value: string) {
  return value.replace(/_/g, " ").toLowerCase();
}

function copyToClipboard(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "absolute";
    textArea.style.left = "-999999px";
    document.body.prepend(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (error) {
      console.error('Fallback clipboard failed', error);
    } finally {
      textArea.remove();
    }
  }
}

export function DashboardStudio() {
  // Support both Solana and EVM wallets
  const { publicKey, signMessage, disconnect: solDisconnect } = useWallet();
  const { address: evmAddress } = useAccount();
  const { signMessageAsync: evmSignMessage } = useSignMessage();
  const { disconnect: evmDisconnect } = useDisconnect();
  const activeAddress = publicKey?.toBase58() || evmAddress;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const signInLock = useRef(false);
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "payments" | "settings">("overview");

  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [onboarding, setOnboarding] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  
  const [form, setForm] = useState({ username: "", displayName: "", bio: "" });
  const [profileForm, setProfileForm] = useState({ displayName: "", bio: "" });
  const [productSearch, setProductSearch] = useState("");
  const [isBuildingProduct, setIsBuildingProduct] = useState(false);
  
  const [productForm, setProductForm] = useState({
    archetype: "TIP" as ProductArchetype,
    title: "",
    description: "",
    priceValue: "5.00",
    currency: "USD",
    accessTerm: "monthly",
    mintName: "",
    symbol: "",
    file: null as File | null,
    imageFile: null as File | null,
    imagePreview: "",
  });
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);

  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const readErrorMessage = async (response: Response) => {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const json = (await response.json()) as { error?: unknown };
      const err = json?.error;
      if (typeof err === "string") return err;
      if (err) return JSON.stringify(err);
      return `Request failed (${response.status})`;
    }
    const text = await response.text();
    return text.trim() ? text.slice(0, 200) : `Request failed (${response.status})`;
  };

  const load = useCallback(async () => {
    if (!activeAddress) {
      setIsAuthenticated(null);
      setData(null);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/dashboard?wallet=${encodeURIComponent(activeAddress)}`);
      if (!response.ok) throw new Error(await readErrorMessage(response));
      const payload = (await response.json()) as DashboardPayload;
      setData(payload);
      if (payload.onboarded) {
        setProfileForm({
          displayName: payload.displayName ?? "",
          bio: payload.bio ?? "",
        });
      }
      setMessage(null);
    } catch (error) {
      setData(null);
      setMessage({
        type: "err",
        text: error instanceof Error ? error.message : "Could not load Studio.",
      });
    } finally {
      setLoading(false);
    }
  }, [activeAddress]);

  useEffect(() => {
    load();
  }, [load]);

  // We removed the auto sign-in hook to prevent wallet race conditions. 
  // Users will now explicitly click "Sign In" to prevent wallet lockups.

  const checkoutLink = useMemo(() => {
    if (!data?.checkoutUrl || typeof window === "undefined") return "";
    return `${window.location.origin}${data.checkoutUrl}`;
  }, [data?.checkoutUrl]);

  const filteredProducts = useMemo(() => {
    if (!data) return [];
    const q = productSearch.trim().toLowerCase();
    if (!q) return data.products;
    return data.products.filter((product) =>
      `${product.title} ${product.description ?? ""} ${product.archetype}`.toLowerCase().includes(q)
    );
  }, [data, productSearch]);

  const notify = (type: "ok" | "err", text: string) => setMessage({ type, text });

  const signIn = async () => {
    if (!activeAddress) return notify("err", "Wallet not connected.");
    if (signInLock.current) return;
    
    const isEVM = activeAddress.startsWith("0x");
    if (isEVM && !evmSignMessage) return notify("err", "EVM Wallet does not support message signing.");
    if (!isEVM && (!signMessage || !publicKey)) return notify("err", "Solana Wallet does not support message signing.");
    
    signInLock.current = true;
    setIsSigningIn(true);
    setMessage(null);
    try {
      const nonceRes = await fetch("/api/v1/auth/nonce");
      if (!nonceRes.ok) throw new Error("Could not fetch nonce.");
      const { nonce } = await nonceRes.json();
      
      const message = `Sign in to NodeBlink: ${nonce}`;
      let signaturePayload: number[] | string;

      if (isEVM) {
        signaturePayload = await evmSignMessage({ message });
      } else {
        const messageBytes = new TextEncoder().encode(message);
        const signature = await signMessage!(messageBytes);
        signaturePayload = Array.from(signature);
      }
      
      const loginRes = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          signature: signaturePayload,
          publicKey: activeAddress,
        }),
      });
      
      if (!loginRes.ok) {
        const err = await loginRes.json();
        throw new Error(err.error ?? "Login failed.");
      }
      
      setIsAuthenticated(true);
      await load();
    } catch (error) {
      notify("err", error instanceof Error ? error.message : "Failed to sign in.");
    } finally {
      setIsSigningIn(false);
      signInLock.current = false;
    }
  };

  const signOut = async () => {
    if (activeAddress?.startsWith("0x")) {
      evmDisconnect();
    } else {
      solDisconnect();
    }
    setData(null);
  };

  const onboard = async () => {
    if (!activeAddress) return;
    setOnboarding(true);
    setMessage(null);
    try {
      const response = await fetch("/api/v1/creators/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: activeAddress,
          username: form.username,
          displayName: form.displayName,
          bio: form.bio,
          legalAccepted,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Onboarding failed");
      notify("ok", "Your creator profile is live.");
      await load();
    } catch (error) {
      notify("err", error instanceof Error ? error.message : "Onboarding failed");
    } finally {
      setOnboarding(false);
    }
  };

  const saveProfile = async () => {
    if (!activeAddress) return;
    try {
      const response = await fetch("/api/v1/creators/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: activeAddress,
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
      reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const createProduct = async () => {
    if (!activeAddress || !data?.username) return;
    if (!productForm.title.trim()) return notify("err", "Give your product a title.");

    const priceValue = Number(productForm.priceValue);
    if (!Number.isFinite(priceValue) || priceValue <= 0) return notify("err", "Enter a valid price.");

    setSavingProduct(true);
    setMessage(null);

    try {
      if (productForm.archetype === "UNLOCK_DOCUMENT") {
        if (!productForm.file) throw new Error("Choose a PDF or file to sell.");
        const base64Data = await readFileBase64(productForm.file);
        const response = await fetch("/api/v1/assets/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: activeAddress,
            creatorUsername: data.username,
            filename: productForm.file.name,
            base64Data,
            title: productForm.title,
            priceValue,
            currency: productForm.currency,
          }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Upload failed");
      } else {
        const response = await fetch("/api/v1/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: activeAddress,
            archetype: productForm.archetype,
            title: productForm.title,
            description: productForm.description || undefined,
            priceValue,
            currency: productForm.currency,
            accessTerm: productForm.archetype === "ACCESS_PASS" ? productForm.accessTerm : undefined,
            mintName: productForm.archetype === "MINT_NFT" ? productForm.mintName || productForm.title : undefined,
            symbol: productForm.archetype === "MINT_NFT" ? productForm.symbol || "PASS" : undefined,
          }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Create failed");

        // Upload product image if one was selected
        if (productForm.imageFile && payload.product?.id) {
          const imgBase64 = await readFileBase64(productForm.imageFile);
          await fetch("/api/v1/products/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              walletAddress: activeAddress,
              filename: productForm.imageFile.name,
              base64Data: imgBase64,
              productId: payload.product.id,
            }),
          });
        }
      }

      setProductForm((f) => ({ ...f, title: "", description: "", file: null, imageFile: null, imagePreview: "" }));
      setIsBuildingProduct(false);
      notify("ok", "Product added to your checkout page.");
      await load();
    } catch (error) {
      notify("err", error instanceof Error ? error.message : "Could not create product");
    } finally {
      setSavingProduct(false);
    }
  };

  const removeProduct = async (id: string) => {
    if (!activeAddress) return;
    try {
      const response = await fetch(`/api/v1/products/${id}?wallet=${encodeURIComponent(activeAddress)}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Remove failed");
      notify("ok", "Product removed.");
      await load();
    } catch (error) {
      notify("err", error instanceof Error ? error.message : "Remove failed");
    }
  };

  return (
    <div className="shell stack animate-rise" style={{ padding: "0 0 64px" }}>
      {message && <p className={message.type === "ok" ? "notice notice-ok" : "notice notice-err"}>{message.text}</p>}

      {!activeAddress ? (
        <div className="panel" style={{ padding: 28, textAlign: 'center' }}>
          <p className="muted" style={{ margin: 0 }}>Connect your Solana or EVM wallet to open your studio.</p>
        </div>
      ) : loading ? (
        <div className="panel" style={{ padding: 28, display: "flex", gap: 10, alignItems: "center" }}>
          <Loader2 className="animate-spin" size={18} /> Loading your studio…
        </div>
      ) : data && !data.onboarded ? (
        <div className="panel stack" style={{ padding: 32, maxWidth: 480, margin: '0 auto' }}>
          <h2 style={{ margin: 0, fontSize: 24 }}>Claim your profile</h2>
          <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>Pick a universal handle for your checkout routing URL.</p>
          
          <label className="field" style={{ marginTop: 16 }}>
            <span>Username</span>
            <input className="input" placeholder="yourname" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase() }))} />
          </label>
          <label className="field">
            <span>Display name</span>
            <input className="input" placeholder="Your brand or name" value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} />
          </label>
          <label className="field">
            <span>Bio (optional)</span>
            <textarea className="input" rows={3} placeholder="What do you create?" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
          </label>
          
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 16, cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={legalAccepted} 
              onChange={(e) => setLegalAccepted(e.target.checked)} 
              style={{ marginTop: 4, cursor: 'pointer', width: 16, height: 16 }}
            />
            <span style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
              By creating an account, I agree to the <a href="/legal/terms" target="_blank" style={{ color: 'var(--text)', textDecoration: 'underline' }}>Terms of Service</a> and <a href="/legal/privacy" target="_blank" style={{ color: 'var(--text)', textDecoration: 'underline' }}>Privacy Policy</a>, and understand NodeBlink does not custody funds.
            </span>
          </label>

          <button type="button" className="btn btn-primary" style={{ marginTop: 24 }} disabled={onboarding || !legalAccepted} onClick={onboard}>
            {onboarding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Claim username
          </button>
        </div>
      ) : data?.onboarded ? (
        <div className="stack" style={{ gap: 32 }}>
          {/* Dashboard Header / Profile */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 24, borderBottom: '1px solid var(--color-line)' }}>
            <div>
              <h1 className="display" style={{ margin: 0, fontSize: 28 }}>@{data.username}</h1>
              <p className="muted" style={{ margin: "4px 0 0", fontSize: 15 }}>{data.displayName}</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href={data.checkoutUrl} className="btn btn-secondary" target="_blank" rel="noreferrer">
                <ExternalLink size={16} /> View Checkout
              </a>
              <button type="button" className="btn btn-ghost" onClick={signOut}>
                Sign Out
              </button>
            </div>
          </div>

          {/* Vercel-style Tab Navigation */}
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--color-line)', paddingBottom: 16 }}>
            {[
              { id: 'overview', label: 'Overview', icon: LayoutGrid },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'payments', label: 'Payments', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                    background: isActive ? 'var(--color-line)' : 'transparent',
                    color: isActive ? 'var(--text)' : 'var(--muted)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={16} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="stack animate-rise" style={{ gap: 24 }}>
              <div className="stat-grid">
                <div className="stat">
                  <span className="muted">Total Volume</span>
                  <strong>${data.metrics.volume.toFixed(2)}</strong>
                </div>
                <div className="stat">
                  <span className="muted">Payments</span>
                  <strong>{data.metrics.transactions}</strong>
                </div>
                <div className="stat">
                  <span className="muted">Active Products</span>
                  <strong>{data.metrics.products}</strong>
                </div>
              </div>

              <div className="panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Your Universal Link</h3>
                  <p className="muted" style={{ margin: "4px 0 0", fontSize: 14 }}>Share this link to accept multi-chain crypto and fiat payments instantly.</p>
                </div>
                <div className="product-row" style={{ background: 'var(--bg)', borderRadius: 8 }}>
                  <code style={{ fontSize: 14, color: 'var(--text)' }}>{checkoutLink}</code>
                  <button type="button" className="btn btn-secondary" onClick={() => { copyToClipboard(checkoutLink); notify("ok", "Link copied."); }}>
                    <Copy size={16} /> Copy
                  </button>
                </div>
              </div>

              <div className="panel stack" style={{ padding: 24, border: '1px solid color-mix(in srgb, #9a7bff, transparent 80%)', background: 'color-mix(in srgb, #9a7bff, transparent 97%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(154,123,255,0.12)', display: 'grid', placeItems: 'center', color: '#9a7bff' }}>
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16 }}>Enable Fiat Payouts (Stripe)</h3>
                    <p className="muted" style={{ margin: 0, fontSize: 13 }}>Connect Stripe to accept Visa, Mastercard, and Apple Pay on your checkout page.</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn"
                  style={{ background: '#9a7bff', color: '#fff', alignSelf: 'flex-start', marginTop: 8 }}
                  onClick={async () => {
                    if (!activeAddress) return;
                    try {
                      const res = await fetch('/api/v1/stripe/connect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ walletAddress: activeAddress }) });
                      const json = await res.json() as { url?: string; error?: string };
                      if (json.url) window.location.href = json.url; else notify('err', json.error ?? 'Stripe failed');
                    } catch { notify('err', 'Stripe failed'); }
                  }}
                >
                  <CreditCard size={16} /> Connect Stripe
                </button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="stack animate-rise" style={{ gap: 24 }}>
              {!isBuildingProduct ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 24 }}>Your Products</h2>
                      <p className="muted" style={{ margin: "4px 0 0", fontSize: 14 }}>Manage your active products and gated files.</p>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={() => setIsBuildingProduct(true)}>
                      <Plus size={16} /> New Product
                    </button>
                  </div>

                  <div className="panel stack" style={{ padding: 0, overflow: 'hidden' }}>
                    {data.products.length === 0 ? (
                      <div style={{ padding: 48, textAlign: 'center' }}>
                        <Package size={32} className="muted" style={{ margin: "0 auto 16px", opacity: 0.5 }} />
                        <h3 style={{ margin: 0, fontSize: 16 }}>No products yet</h3>
                        <p className="muted" style={{ margin: "8px 0 0", fontSize: 14 }}>Create your first product to start earning.</p>
                      </div>
                    ) : (
                      <div className="stack" style={{ gap: 0 }}>
                        {data.products.map((product, index) => {
                          const productUrl = typeof window !== 'undefined' ? `${window.location.origin}/pay/${data.username}/${product.id}` : '';
                          return (
                          <div key={product.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderTop: index !== 0 ? '1px solid var(--color-line)' : 'none', transition: 'background 0.2s ease' }} onMouseOver={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--color-panel), var(--text) 2%)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.title} style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--color-line)' }} />
                              ) : (
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg)', border: '1px solid var(--color-line)', display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>
                                  <Package size={20} />
                                </div>
                              )}
                              <div>
                                <strong style={{ fontSize: 16 }}>{product.title}</strong>
                                <p className="muted" style={{ margin: "4px 0 0", fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span className="badge" style={{ background: 'var(--bg)', border: '1px solid var(--color-line)', color: 'var(--muted)', fontSize: 11, padding: '2px 8px' }}>{formatArchetype(product.archetype)}</span>
                                  {product.currency === "USD" ? `$${(Number(product.priceMinorUnits) / 100).toFixed(2)}` : `${lamportsToSol(product.priceMinorUnits).toFixed(2)} SOL`}
                                </p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                title="Copy product link"
                                style={{ padding: '8px 12px', fontSize: 13 }}
                                onClick={() => {
                                  copyToClipboard(productUrl);
                                  setCopiedProductId(product.id);
                                  setTimeout(() => setCopiedProductId(null), 2000);
                                }}
                              >
                                {copiedProductId === product.id ? <Check size={14} /> : <Link2 size={14} />}
                                {copiedProductId === product.id ? 'Copied!' : 'Copy Link'}
                              </button>
                              <button type="button" className="btn btn-ghost" onClick={() => removeProduct(product.id)} title="Delete product"><Trash2 size={16} /></button>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="panel stack animate-rise" style={{ padding: 32, maxWidth: 640, margin: '0 auto', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h2 style={{ margin: 0, fontSize: 24 }}>Add a Product</h2>
                    <button type="button" className="btn btn-ghost" onClick={() => setIsBuildingProduct(false)}>Cancel</button>
                  </div>
                  
                  <div className="type-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    {PRODUCT_TYPES.map((type) => (
                      <button key={type.id} type="button" className={`type-card${productForm.archetype === type.id ? " type-card-active" : ""}`} onClick={() => setProductForm((f) => ({ ...f, archetype: type.id }))}>
                        <strong>{type.label}</strong>
                        <span style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{type.hint}</span>
                      </button>
                    ))}
                  </div>

                  <label className="field" style={{ marginTop: 16 }}>
                    <span>Title</span>
                    <input className="input" placeholder="e.g. Creator Pass" value={productForm.title} onChange={(e) => setProductForm((f) => ({ ...f, title: e.target.value }))} />
                  </label>

                  <div className="grid-2">
                    <label className="field">
                      <span>Currency</span>
                      <div style={{ display: 'flex', background: 'var(--color-panel)', borderRadius: 10, padding: 4, border: '1px solid var(--color-line)' }}>
                        <button type="button" onClick={() => setProductForm(f => ({ ...f, currency: 'USD' }))} style={{ flex: 1, padding: '8px 12px', fontSize: 13, fontWeight: 600, borderRadius: 6, background: productForm.currency === 'USD' ? 'var(--text)' : 'transparent', color: productForm.currency === 'USD' ? 'var(--bg)' : 'var(--muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}>$ USD</button>
                        <button type="button" onClick={() => setProductForm(f => ({ ...f, currency: 'SOL' }))} style={{ flex: 1, padding: '8px 12px', fontSize: 13, fontWeight: 600, borderRadius: 6, background: productForm.currency === 'SOL' ? 'var(--text)' : 'transparent', color: productForm.currency === 'SOL' ? 'var(--bg)' : 'var(--muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}>◎ SOL</button>
                      </div>
                    </label>
                    <label className="field">
                      <span>Price</span>
                      <input className="input" type="number" min="0.01" step="0.01" value={productForm.priceValue} onChange={(e) => setProductForm((f) => ({ ...f, priceValue: e.target.value }))} />
                    </label>
                  </div>

                  {productForm.archetype === "UNLOCK_DOCUMENT" && (
                    <label className="field">
                      <span>PDF or file</span>
                      <div className="file-drop" style={{ background: 'var(--bg)', borderColor: 'var(--color-line)', padding: 24, textAlign: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <FileUp size={24} style={{ color: 'var(--text)' }} />
                        <input type="file" onChange={(e) => setProductForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))} />
                        <span style={{ fontWeight: 500 }}>{productForm.file ? productForm.file.name : "Click to upload your file"}</span>
                        <span className="muted" style={{ fontSize: 12 }}>Maximum size 25MB</span>
                      </div>
                    </label>
                  )}

                  {/* Product Cover Image Upload */}
                  <label className="field" style={{ marginTop: 8 }}>
                    <span>Cover Image (shown in social media previews)</span>
                    <div
                      className="file-drop"
                      style={{
                        background: productForm.imagePreview ? 'transparent' : 'var(--bg)',
                        borderColor: 'var(--color-line)',
                        padding: productForm.imagePreview ? 0 : 24,
                        textAlign: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden',
                        minHeight: 120,
                        borderRadius: 12,
                      }}
                    >
                      {productForm.imagePreview ? (
                        <img
                          src={productForm.imagePreview}
                          alt="Preview"
                          style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12 }}
                        />
                      ) : (
                        <>
                          <ImagePlus size={24} style={{ color: 'var(--muted)' }} />
                          <span style={{ fontWeight: 500, color: 'var(--muted)' }}>Click to upload cover image</span>
                          <span className="muted" style={{ fontSize: 12 }}>PNG, JPG, or WebP — max 5MB</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          if (f) {
                            const url = URL.createObjectURL(f);
                            setProductForm((prev) => ({ ...prev, imageFile: f, imagePreview: url }));
                          }
                        }}
                      />
                    </div>
                  </label>

                  <button type="button" className="btn btn-primary" style={{ marginTop: 24, width: '100%' }} disabled={savingProduct} onClick={createProduct}>
                    {savingProduct ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Publish Product
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: PAYMENTS */}
          {activeTab === 'payments' && (
            <section className="panel stack animate-rise" style={{ padding: 32 }}>
              <h3 style={{ marginTop: 0, fontSize: 20 }}>Recent Payments</h3>
              {data.transactions.length === 0 ? (
                <p className="muted" style={{ margin: 0 }}>No payments recorded yet.</p>
              ) : (
                <div className="stack" style={{ gap: 8 }}>
                  {data.transactions.map((tx) => (
                    <div key={tx.id} className="product-row" style={{ background: 'var(--bg)', borderRadius: 8 }}>
                      <div>
                        <strong>{tx.status}</strong>
                        <p className="muted" style={{ margin: "2px 0 0", fontSize: 13 }}>
                          {Number(tx.grossAmount).toFixed(4)} SOL · {new Date(tx.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* TAB CONTENT: SETTINGS */}
          {activeTab === 'settings' && (
            <section className="panel stack animate-rise" style={{ padding: 32, maxWidth: 600 }}>
              <h3 style={{ marginTop: 0, fontSize: 20 }}>Profile Settings</h3>
              <label className="field">
                <span>Display name</span>
                <input className="input" value={profileForm.displayName} disabled style={{ opacity: 0.7 }} />
              </label>
              <label className="field">
                <span>Bio</span>
                <textarea className="input" rows={3} value={profileForm.bio} onChange={(e) => setProfileForm((f) => ({ ...f, bio: e.target.value }))} />
              </label>
              <button type="button" className="btn btn-secondary" style={{ alignSelf: 'flex-start', marginTop: 12 }} onClick={saveProfile}>
                Save profile
              </button>
            </section>
          )}
        </div>
      ) : (
        <div className="panel stack" style={{ padding: 32, textAlign: 'center' }}>
          <h2 style={{ margin: 0 }}>Studio unavailable</h2>
          <p className="muted" style={{ margin: 0 }}>The backend didn't return your data. Try refreshing.</p>
          <button type="button" className="btn btn-primary" style={{ alignSelf: 'center', marginTop: 16 }} onClick={load}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      )}
    </div>
  );
}
