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
  Sparkles,
  Server,
  Shield,
} from "lucide-react";
import type { PublicProtocolStats } from "@/lib/public-stats";
import { SUPPORT_EMAIL } from "@/lib/brand";

type Props = {
  stats: PublicProtocolStats;
};

function getFaqs(stats: PublicProtocolStats) {
  return [
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
}

export function LandingPage({ stats }: Props) {
  const faqs = getFaqs(stats);
  const volumeLabel =
    stats.volumeSol > 0
      ? `${stats.volumeSol.toFixed(2)} SOL`
      : "—";
  const steps = [
    {
      title: "Claim your creator link",
      copy: `Connect a wallet in Creator Studio and register your username. Your public page becomes ${stats.domain}/creator/you.`,
    },
    {
      title: "Share one checkout URL",
      copy: `Post the link on X, Discord, or your site. Wallets read ${stats.domain}/actions.json and unfurl pay buttons—no third-party registry.`,
    },
    {
      title: "Get paid on Solana",
      copy: "Buyers sign in Phantom or Solflare. NodeBlink splits each payment: creator wallet + protocol fee, with congestion-safe fees for reliable confirmation.",
    },
  ];

  return (
    <main>
      <section className="shell animate-rise" style={{ padding: "56px 0 26px" }}>
        <div className="hero-mesh">
          <div className="grid-2" style={{ position: "relative", zIndex: 1, alignItems: "center" }}>
            <div className="stack" style={{ gap: 18 }}>
              <span className="badge" style={{ width: "fit-content" }}>
                <Globe2 size={14} /> Live on {stats.network} · {stats.domain}
              </span>
              <h1
                className="display"
                style={{
                  fontSize: "clamp(2.5rem, 5.4vw, 4.1rem)",
                  lineHeight: 1.02,
                  margin: 0,
                }}
              >
                Checkout infrastructure for creators—built for{" "}
                <span style={{ color: "white" }}>wallet-native</span> commerce.
              </h1>
              <p style={{ fontSize: 17, lineHeight: 1.8, margin: 0, maxWidth: 620 }}>
                NodeBlink helps you sell tips, gated files, access passes, and collectibles on Solana.
                Share one link. Wallets unfurl pay buttons on social feeds and mobile wallets.
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
              <div className="logo-strip" aria-label="Supported wallets">
                <span className="logo-chip">Phantom</span>
                <span className="logo-chip">Solflare</span>
                <span className="logo-chip">Solana Actions</span>
              </div>
            </div>

            <div className="stack" style={{ gap: 14 }}>
              <div className="panel stack" style={{ padding: 22 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>
                  What your audience sees
                </p>
                <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
                  Share a creator link. Wallets read <code>/actions.json</code> and show “Pay” buttons
                  directly inside the feed.
                </p>
                <div className="product-row">
                  <div>
                    <strong>Tip jar</strong>
                    <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
                      One click · SOL
                    </p>
                  </div>
                  <span className="badge">Pay</span>
                </div>
                <div className="product-row">
                  <div>
                    <strong>Gated PDF</strong>
                    <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
                      Encrypted · unlock after confirmation
                    </p>
                  </div>
                  <span className="badge">Unlock</span>
                </div>
              </div>
            </div>
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
            <Globe2 size={22} color="var(--brand-start)" />
            <h3 style={{ margin: 0 }}>actions.json on your domain</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
              Wallets discover <code>{stats.domain}/actions.json</code> and map creator pages to the Actions API—no Dial-style middleman.
            </p>
          </article>
          <article className="card stack" style={{ padding: 22 }}>
            <Smartphone size={22} color="var(--brand-start)" />
            <h3 style={{ margin: 0 }}>Mobile wallet handoff</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
              In-app browsers redirect to <code>solana-action:</code> links and Phantom browse fallback so mobile buyers are not stuck on a dead page.
            </p>
          </article>
          <article className="card stack" style={{ padding: 22 }}>
            <Wallet size={22} color="var(--brand-start)" />
            <h3 style={{ margin: 0 }}>SOL & USDC checkout</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
              Split payments in one transaction: creator payout, protocol fee, optional memo, and congestion-safe priority fees.
            </p>
          </article>
          <article className="card stack" style={{ padding: 22 }}>
            <FileKey size={22} color="var(--brand-start)" />
            <h3 style={{ margin: 0 }}>Encrypted delivery</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
              Gated files use AES-256-GCM keys released only after confirmation—configured with your <code>NODEBLINK_ENC_KEY</code>.
            </p>
          </article>
          <article className="card stack" style={{ padding: 22 }}>
            <Sparkles size={22} color="var(--brand-start)" />
            <h3 style={{ margin: 0 }}>Made for sharing</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
              Each creator page publishes OpenGraph/Twitter metadata and a <code>solana:action</code>{" "}
              tag so links unfurl cleanly on social networks.
            </p>
          </article>
          <article className="card stack" style={{ padding: 22 }}>
            <Server size={22} color="var(--brand-start)" />
            <h3 style={{ margin: 0 }}>Operator-friendly</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
              A single Next.js app powers landing, Creator Studio, checkout, Actions API, and health
              checks. Deploy on one droplet.
            </p>
          </article>
        </div>
      </section>

      <section id="security" className="shell" style={{ paddingBottom: 56 }}>
        <div className="panel" style={{ padding: 28 }}>
          <div className="grid-2" style={{ alignItems: "start" }}>
            <div className="stack">
              <p
                className="muted"
                style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.2em", fontSize: 12 }}
              >
                Security posture
              </p>
              <h2 className="display" style={{ margin: 0, fontSize: 30 }}>
                Non-custodial by design
              </h2>
              <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
                NodeBlink never takes custody of creator funds. Buyers sign a Solana transaction that
                splits payment to the creator wallet and the protocol treasury. Gated files are
                encrypted at rest and unlocked only after confirmation.
              </p>
            </div>
            <div className="stack">
              <div className="card stack" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Shield size={18} color="var(--brand-start)" />
                  <strong>Encrypted file delivery</strong>
                </div>
                <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
                  AES-256-GCM encryption keys are released only after on-chain confirmation via the
                  confirmation API.
                </p>
              </div>
              <div className="card stack" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ShieldCheck size={18} color="var(--brand-start)" />
                  <strong>Wallet-native UX</strong>
                </div>
                <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
                  The checkout flow is a standard wallet approve. No custodial accounts, no chargebacks,
                  no hidden settlement layer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="unfurl" className="shell stack" style={{ paddingBottom: 56 }}>
        <h2 className="display" style={{ fontSize: 32, margin: 0 }}>
          Unfurls on social
        </h2>
        <div className="grid-2" style={{ alignItems: "start" }}>
          <div className="card stack" style={{ padding: 22 }}>
            <h3 style={{ margin: 0 }}>What wallets need</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
              Wallets look for <code>{stats.domain}/actions.json</code> and map creator URLs to an
              Actions API endpoint.
            </p>
            <div className="product-row">
              <code style={{ wordBreak: "break-all" }}>{stats.actionsJsonUrl}</code>
              <a className="btn btn-secondary" href="/actions.json" target="_blank" rel="noreferrer">
                Open
              </a>
            </div>
          </div>
          <div className="card stack" style={{ padding: 22 }}>
            <h3 style={{ margin: 0 }}>What social networks need</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
              Twitter / Discord unfurls are driven by OpenGraph + Twitter meta tags. NodeBlink publishes
              them for the homepage and each creator page.
            </p>
            <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
              Best practice: share <code>{stats.domain}/creator/yourname</code> (not the Actions API URL).
            </p>
          </div>
        </div>
      </section>

      <section className="shell" style={{ paddingBottom: 72 }}>
        <div className="hero-gradient stack">
          <h2 className="display" style={{ margin: 0, fontSize: 32, position: "relative", zIndex: 1 }}>
            Ready to ship today
          </h2>
          <p style={{ margin: 0, maxWidth: 620, lineHeight: 1.75, position: "relative", zIndex: 1 }}>
            Open Creator Studio, claim your username, add your first product, and start sharing a link that
            wallets can instantly understand.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, position: "relative", zIndex: 1 }}>
            <Link href="/dashboard" className="btn btn-primary">
              Open Creator Studio <ArrowRight size={16} />
            </Link>
            <Link href="/creator/demo" className="btn btn-secondary">
              Preview checkout
            </Link>
          </div>
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
