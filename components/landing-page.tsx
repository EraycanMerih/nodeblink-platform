import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  FileKey,
  Globe2,
  Link2,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import type { PublicProtocolStats } from "@/lib/public-stats";
import { SUPPORT_EMAIL } from "@/lib/brand";

type Props = {
  stats: PublicProtocolStats;
};

const steps = [
  {
    title: "Claim your creator link",
    copy: "Connect a wallet in Creator Studio and register your username. Your public page becomes nodeblink.dev/creator/you.",
  },
  {
    title: "Share one checkout URL",
    copy: "Post the link on X, Discord, or your site. Wallets read actions.json on nodeblink.dev and unfurl pay buttons—no third-party blink registry.",
  },
  {
    title: "Get paid on Solana",
    copy: "Buyers sign in Phantom or Solflare. NodeBlink splits each payment: creator wallet + protocol fee, with priority fees for reliable confirmation.",
  },
];

const faqs = [
  {
    q: "Do you hold my funds?",
    a: "No. NodeBlink is non-custodial. Payments move directly on Solana from the buyer to your wallet and the protocol treasury.",
  },
  {
    q: "What is the protocol fee?",
    a: `The live deployment uses a ${stats.platformFeePercent}% platform fee (configurable between ${stats.feeRangeLabel}). Creators receive about ${stats.creatorSharePercent}% of each payment.`,
  },
  {
    q: "How do gated PDFs work?",
    a: "Files are stored encrypted. After on-chain confirmation, buyers receive a secure download key through the confirmation API.",
  },
  {
    q: "Do I need a mint signer key?",
    a: stats.mintFulfillmentEnabled
      ? "Server-side NFT minting is enabled for this deployment."
      : "Not required. Mint products collect payment on-chain; automatic NFT minting can be enabled later by adding a mint signer key to your server environment.",
  },
];

export function LandingPage({ stats }: Props) {
  const volumeLabel =
    stats.volumeSol > 0
      ? `${stats.volumeSol.toFixed(2)} SOL`
      : "—";

  return (
    <main>
      <section className="shell animate-rise" style={{ padding: "64px 0 32px" }}>
        <div className="stack" style={{ gap: 22, maxWidth: 800 }}>
          <span className="badge">
            <Globe2 size={14} /> Live on {stats.network} · {stats.domain}
          </span>
          <h1
            className="display"
            style={{ fontSize: "clamp(2.4rem, 5.5vw, 4rem)", lineHeight: 1.05, margin: 0 }}
          >
            Sell digital products with a link your audience{" "}
            <span className="text-gradient">already knows how to use</span>.
          </h1>
          <p className="muted" style={{ fontSize: 18, lineHeight: 1.75, margin: 0 }}>
            NodeBlink is checkout infrastructure for Solana creators—tips, PDF unlocks, access passes, and collectibles—with native wallet buttons on social feeds and mobile deep links built in.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link href="/dashboard" className="btn btn-primary">
              Open Creator Studio <ArrowRight size={16} />
            </Link>
            <Link href="/creator/demo" className="btn btn-secondary">
              Try the live demo
            </Link>
          </div>
          <div className="trust-strip">
            <span>
              <BadgeCheck size={14} /> {stats.feeRangeLabel} protocol fee
            </span>
            <span>
              <ShieldCheck size={14} /> Non-custodial
            </span>
            <span>
              <Link2 size={14} /> {stats.actionsJsonUrl.replace("https://", "")}
            </span>
          </div>
        </div>
      </section>

      <section className="shell" style={{ paddingBottom: 40 }}>
        <div className="stat-grid">
          <div className="stat">
            <span className="muted">Registered creators</span>
            <strong>{stats.creators}</strong>
          </div>
          <div className="stat">
            <span className="muted">Active products</span>
            <strong>{stats.products}</strong>
          </div>
          <div className="stat">
            <span className="muted">Confirmed payments</span>
            <strong>{stats.confirmedPayments}</strong>
          </div>
          <div className="stat">
            <span className="muted">Volume processed</span>
            <strong>{volumeLabel}</strong>
          </div>
        </div>
        <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
          Stats refresh from the NodeBlink database. Before your first sale, counts may read zero—that is expected.
        </p>
      </section>

      <section id="how-it-works" className="shell stack" style={{ paddingBottom: 48 }}>
        <h2 className="display" style={{ fontSize: 32, margin: 0 }}>
          How it works
        </h2>
        <div className="grid-3">
          {steps.map((step, index) => (
            <article key={step.title} className="card stack" style={{ padding: 22 }}>
              <span className="step-number">{index + 1}</span>
              <h3 style={{ margin: 0 }}>{step.title}</h3>
              <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
                {step.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="shell" style={{ paddingBottom: 48 }}>
        <div className="panel" style={{ padding: 28 }}>
          <div className="grid-2" style={{ alignItems: "start" }}>
            <div className="stack">
              <p
                className="muted"
                style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.2em", fontSize: 12 }}
              >
                Live demo catalog
              </p>
              <h2 className="display" style={{ margin: 0, fontSize: 30 }}>
                Real products on <code>/creator/demo</code>
              </h2>
              <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
                These are the same items buyers see in wallet unfurls. Each maps to a Solana Action at{" "}
                <code>/api/v1/actions/creator/demo</code>.
              </p>
              <Link href="/creator/demo" className="btn btn-primary" style={{ width: "fit-content" }}>
                Open demo checkout
              </Link>
            </div>
            <div className="stack">
              {stats.demoProducts.map((product) => (
                <div key={product.id} className="product-row">
                  <div>
                    <strong>{product.title}</strong>
                    <p className="muted" style={{ margin: "4px 0 0", fontSize: 13, textTransform: "capitalize" }}>
                      {product.archetype}
                    </p>
                  </div>
                  <span className="badge">{product.priceLabel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="shell stack" style={{ padding: "8px 0 56px" }}>
        <h2 className="display" style={{ fontSize: 32, margin: 0 }}>
          What you get
        </h2>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
          <article className="card stack" style={{ padding: 22 }}>
            <Globe2 size={22} color="#02a8b5" />
            <h3 style={{ margin: 0 }}>actions.json on your domain</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
              Wallets discover <code>{stats.domain}/actions.json</code> and map creator pages to the Actions API—no Dial-style middleman.
            </p>
          </article>
          <article className="card stack" style={{ padding: 22 }}>
            <Smartphone size={22} color="#02a8b5" />
            <h3 style={{ margin: 0 }}>Mobile wallet handoff</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
              In-app browsers redirect to <code>solana-action:</code> links and Phantom browse fallback so mobile buyers are not stuck on a dead page.
            </p>
          </article>
          <article className="card stack" style={{ padding: 22 }}>
            <Wallet size={22} color="#02a8b5" />
            <h3 style={{ margin: 0 }}>SOL & USDC checkout</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
              Split payments in one transaction: creator payout, protocol fee, optional memo, and congestion-safe priority fees.
            </p>
          </article>
          <article className="card stack" style={{ padding: 22 }}>
            <FileKey size={22} color="#02a8b5" />
            <h3 style={{ margin: 0 }}>Encrypted delivery</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
              Gated files use AES-256-GCM keys released only after confirmation—configured with your <code>NODEBLINK_ENC_KEY</code>.
            </p>
          </article>
        </div>
      </section>

      <section id="pricing" className="shell" style={{ paddingBottom: 48 }}>
        <div className="hero-gradient stack">
          <h2 className="display" style={{ margin: 0, fontSize: 32, position: "relative", zIndex: 1 }}>
            Fees that stay easy to explain
          </h2>
          <p style={{ margin: 0, maxWidth: 560, lineHeight: 1.7, position: "relative", zIndex: 1 }}>
            No monthly platform lock-in. You earn when creators earn. The live fee on this deployment is{" "}
            <strong>{stats.platformFeePercent}%</strong> per transaction.
          </p>
          <div className="stat-grid" style={{ position: "relative", zIndex: 1 }}>
            <div className="stat">
              <span className="muted">Protocol fee (now)</span>
              <strong>{stats.platformFeePercent}%</strong>
            </div>
            <div className="stat">
              <span className="muted">Creator receives</span>
              <strong>~{stats.creatorSharePercent}%</strong>
            </div>
            <div className="stat">
              <span className="muted">Allowed range</span>
              <strong>{stats.feeRangeLabel}</strong>
            </div>
            <div className="stat">
              <span className="muted">Settlement</span>
              <strong>On-chain</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="shell stack" style={{ paddingBottom: 72 }}>
        <h2 className="display" style={{ fontSize: 28, margin: 0 }}>
          Common questions
        </h2>
        <div className="stack">
          {faqs.map((item) => (
            <details key={item.q} className="faq-item">
              <summary>{item.q}</summary>
              <p className="muted" style={{ margin: "12px 0 0", lineHeight: 1.65 }}>
                {item.a}
              </p>
            </details>
          ))}
        </div>
        <p className="muted" style={{ margin: 0 }}>
          Need help? Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </section>
    </main>
  );
}
