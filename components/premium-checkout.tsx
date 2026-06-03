"use client";

import { useCallback, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  Shield,
  Sparkles,
} from "lucide-react";
import type { CreatorActionProduct, CreatorProfileView } from "@/lib/creator-actions";
import { formatSol } from "@/lib/utils";

type Props = {
  creator: CreatorProfileView;
  actionApiUrl: string;
  mobile: boolean;
};

export function PremiumCheckout({ creator, actionApiUrl, mobile }: Props) {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const feeLabel = useMemo(
    () => `${(creator.platformFeeBps / 100).toFixed(1)}% protocol fee`,
    [creator.platformFeeBps],
  );

  const openInWallet = useCallback(() => {
    try {
      window.location.href = `solana-action:${actionApiUrl}`;
    } catch {
      setStatus("Unable to open wallet. Please copy the link and open it inside your wallet.");
    }
  }, [actionApiUrl]);

  const executeCheckout = useCallback(
    async (product: CreatorActionProduct, variantId: string) => {
      if (!publicKey || !signTransaction) {
        setStatus("Connect your wallet to complete checkout.");
        return;
      }

      setBusy(true);
      setStatus("Preparing secure transaction…");

      try {
        const query = new URLSearchParams({
          productId: product.id,
          variant: variantId,
        });

        const response = await fetch(`${actionApiUrl}?${query}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ account: publicKey.toBase58() }),
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message ?? payload.error ?? "Checkout failed");
        }

        const serialized = payload.transaction as string;
        const bytes = Uint8Array.from(atob(serialized), (c) => c.charCodeAt(0));

        let transaction: Transaction | VersionedTransaction;
        try {
          transaction = VersionedTransaction.deserialize(bytes);
        } catch {
          transaction = Transaction.from(bytes);
        }

        const signed = await signTransaction(transaction);
        setStatus("Submitting to Solana…");
        const signature = await connection.sendRawTransaction(signed.serialize(), {
          skipPreflight: false,
        });

        await connection.confirmTransaction(signature, "confirmed");

        const pendingId = payload.transactionId as string | undefined;
        if (pendingId) {
          setTransactionId(pendingId);
          await fetch("/api/v1/transactions/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              signature,
              transactionId: pendingId,
              buyer: publicKey.toBase58(),
            }),
          });
        }

        setStatus(`Payment confirmed · ${signature.slice(0, 8)}…`);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Transaction failed");
      } finally {
        setBusy(false);
      }
    },
    [actionApiUrl, connection, publicKey, signTransaction],
  );

  return (
    <main className="shell stack animate-rise" style={{ padding: "28px 0 56px" }}>
      <section className="hero-mesh stack" style={{ padding: 32 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span className="badge">
            <Sparkles size={14} /> Secure checkout
          </span>
          {creator.featured ? <span className="badge">Verified creator</span> : null}
        </div>
        <div className="grid-2" style={{ alignItems: "start" }}>
          <div className="stack">
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <img
                src={
                  creator.avatarUrl &&
                  !creator.avatarUrl.toLowerCase().includes("coresg-normal.trae.ai/api/ide/v1/text_to_image")
                    ? creator.avatarUrl
                    : `/creator/${creator.username}/action-icon?v=2`
                }
                alt=""
                width={56}
                height={56}
                style={{
                  borderRadius: 16,
                  border: "1px solid color-mix(in srgb, var(--color-line), transparent 20%)",
                  objectFit: "cover",
                  background: "rgba(255,255,255,0.4)",
                }}
              />
              <div className="stack" style={{ gap: 6 }}>
                <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 3.1rem)", letterSpacing: "-0.02em" }}>
                  {creator.displayName}
                </h1>
                <p className="muted" style={{ margin: 0, fontSize: 14 }}>
                  @{creator.username}
                </p>
              </div>
            </div>
            <p style={{ margin: 0, opacity: 0.88, maxWidth: 560, lineHeight: 1.7 }}>{creator.bio}</p>
            <div className="trust-strip">
              <span><Shield size={14} /> Non-custodial</span>
              <span><Lock size={14} /> Encrypted delivery</span>
              <span>{feeLabel}</span>
            </div>
          </div>
          <div className="card stack" style={{ padding: 20 }}>
            <WalletConnectButton />
            {mobile ? (
              <button type="button" className="btn btn-secondary" onClick={openInWallet} disabled={busy}>
                Open in wallet
              </button>
            ) : null}
            <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
              {mobile
                ? "If you’re on mobile, open this checkout inside Phantom/Solflare for the smoothest experience."
                : "Approve the transaction in your wallet. Funds settle instantly."}
            </p>
          </div>
        </div>
      </section>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className="stack">
          {creator.products.map((product) => (
            <article key={product.id} className="panel stack" style={{ padding: 22 }}>
              <div>
                <p className="muted" style={{ margin: 0, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.18em" }}>
                  {product.archetype.replace(/_/g, " ")}
                </p>
                <h2 style={{ margin: "6px 0" }}>{product.title}</h2>
                <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>{product.description}</p>
              </div>
              <div className="stack">
                {product.variants.map((variant) => (
                  <div key={variant.id} className="product-row">
                    <div>
                      <strong>{variant.label}</strong>
                      <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
                        {variant.amountMinorUnits
                          ? product.currency === "SOL"
                            ? formatSol(variant.amountMinorUnits)
                            : `${(variant.amountMinorUnits / 1_000_000).toFixed(2)} USDC`
                          : "Custom amount"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={busy}
                      onClick={() => executeCheckout(product, variant.id)}
                    >
                      {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                      Pay
                    </button>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <aside className="stack" style={{ position: "sticky", top: 88 }}>
          <div className="card stack" style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(99, 91, 255, 0.12)",
                  border: "1px solid rgba(99, 91, 255, 0.18)",
                  color: "rgba(10, 37, 64, 0.86)",
                }}
              >
                <Shield size={22} />
              </div>
              <div>
                <strong>Buyer protection</strong>
                <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                  You review the recipient + amount in-wallet before signing.
                </p>
              </div>
            </div>
            <div className="stat-grid">
              <div className="stat">
                <span className="muted">Products</span>
                <strong>{creator.products.length}</strong>
              </div>
              <div className="stat">
                <span className="muted">Fee</span>
                <strong>{creator.platformFeeBps / 100}%</strong>
              </div>
            </div>
            {status ? (
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, display: "flex", gap: 8, alignItems: "flex-start" }}>
                {status.includes("confirmed") ? <CheckCircle2 size={16} color="#16a34a" /> : null}
                {status}
              </p>
            ) : null}
            {transactionId ? (
              <p className="muted" style={{ margin: 0, fontSize: 12 }}>Receipt id: {transactionId}</p>
            ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
}
