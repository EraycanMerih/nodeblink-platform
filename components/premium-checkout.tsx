"use client";

import { useCallback, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Shield,
} from "lucide-react";
import type { CreatorActionProduct, CreatorProfileView } from "@/lib/creator-actions";
import { formatSol } from "@/lib/utils";

type Props = {
  creator: CreatorProfileView;
  actionApiUrl: string;
  mobile: boolean;
  productId?: string;
};

export function PremiumCheckout({ creator, actionApiUrl, mobile, productId }: Props) {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const visibleProducts = useMemo(() => {
    if (!productId) return creator.products;
    const match = creator.products.find((product) => product.id === productId);
    return match ? [match] : creator.products;
  }, [creator.products, productId]);

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
    <div className="stack" style={{ gap: 24 }}>
      {/* Status alerts */}
      {status ? (
        <p className={status.includes('failed') || status.includes('Unable') || status.includes('Connect') ? 'notice notice-err' : 'notice notice-ok'}>
          {status}
        </p>
      ) : null}

      <div className="card stack" style={{ padding: 20 }}>
        <WalletConnectButton />
        {mobile ? (
          <button type="button" className="btn btn-secondary" onClick={openInWallet} disabled={busy}>
            Open in wallet
          </button>
        ) : null}
      </div>

      <div className="stack" style={{ gap: 12 }}>
        {visibleProducts.map((product) => (
          <div key={product.id} className="stack" style={{ gap: 12 }}>
            {product.variants.map((variant) => (
              <div key={variant.id} className="stripe-product-row">
                <div className="stripe-product-info">
                  <strong>{product.title} {variant.label !== "Default" && `(${variant.label})`}</strong>
                  <span>
                    {variant.amountMinorUnits
                      ? product.currency === "SOL"
                        ? formatSol(variant.amountMinorUnits)
                        : `${(variant.amountMinorUnits / 1_000_000).toFixed(2)} USDC`
                      : "Custom amount"}
                  </span>
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
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 12, opacity: 0.5, gap: 6 }}>
        <Shield size={14} />
        <span style={{ fontSize: 12, fontWeight: 500 }}>Secure non-custodial checkout</span>
      </div>
    </div>
  );
}
