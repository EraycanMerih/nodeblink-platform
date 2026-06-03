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
      a: "No. NodeBlink is non-custodial. Your audience pays on Solana directly to your wallet.",
    },
    {
      q: "What is the protocol fee?",
      a: `A small fee is taken from each payment. On this deployment it is ${stats.platformFeePercent}%. You receive about ${stats.creatorSharePercent}% of each payment.`,
    },
    {
      q: "How do gated PDFs work?",
      a: "Set a price for a file. After payment is confirmed, buyers can unlock and download it.",
    },
    {
      q: "Do I need to code anything?",
      a: "No. Connect your wallet, add what you want to sell, and share your creator link.",
    },
  ];
}

export function LandingPage({ stats }: Props) {
  const faqs = getFaqs(stats);
  const volumeLabel =
    stats.volumeSol > 0
      ? `${stats.volumeSol.toFixed(2)} SOL`
      : "0 SOL";
  const steps = [
    {
      title: "Claim your creator link",
      copy: `Connect your wallet and pick a username. Your link goes live at ${stats.domain}/creator/you.`,
    },
    {
      title: "Share it anywhere",
      copy: "Post your link anywhere. People see a clean preview and pay fast.",
    },
    {
      title: "Get paid instantly",
      copy: "Fans approve in-wallet. Funds go straight to you.",
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
                A checkout link for creators, built for <span className="text-gradient">wallet-native</span>{" "}
                sales.
              </h1>
              <p style={{ fontSize: 17, lineHeight: 1.8, margin: 0, maxWidth: 620 }}>
                Sell tips, files, access passes, and collectibles on Solana. Share one link and let your
                audience pay in seconds.
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
                  <Link2 size={14} /> {stats.domain}/creator/you
                </span>
              </div>
              <div className="logo-strip" aria-label="Supported wallets">
                <span className="logo-chip">Phantom</span>
                <span className="logo-chip">Solflare</span>
              </div>
            </div>

            <div className="stack" style={{ gap: 14 }}>
              <div className="panel stack" style={{ padding: 18 }}>
                <img
                  src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=premium%202026%20fintech%20web%20app%20screenshot%20of%20a%20creator%20checkout%20page%2C%20indigo%20violet%20gradient%20accents%2C%20clean%20typography%2C%20subtle%20shadows%2C%20product%20cards%20with%20pay%20buttons%2C%20modern%20minimal%20UI%2C%20realistic%2C%20high%20detail&image_size=landscape_16_9"
                  alt="Creator checkout preview"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: 18,
                    border: "1px solid var(--color-line)",
                    background: "color-mix(in srgb, var(--color-panel), transparent 8%)",
                  }}
                />
                <div className="trust-strip" style={{ justifyContent: "space-between" }}>
                  <span>
                    <Wallet size={14} /> Wallet-native pay
                  </span>
                  <span>
                    <ShieldCheck size={14} /> Non-custodial
                  </span>
                </div>
              </div>
              <div className="panel stack" style={{ padding: 18 }}>
                <img
                  src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=premium%202026%20creator%20studio%20dashboard%20web%20app%20screenshot%2C%20analytics%20cards%2C%20product%20list%2C%20indigo%20violet%20accents%2C%20clean%20modern%20fintech%20design%2C%20realistic%2C%20high%20detail&image_size=landscape_16_9"
                  alt="Creator Studio preview"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: 18,
                    border: "1px solid var(--color-line)",
                    background: "color-mix(in srgb, var(--color-panel), transparent 8%)",
                  }}
                />
                <div className="trust-strip" style={{ justifyContent: "space-between" }}>
                  <span>
                    <Server size={14} /> Products + delivery
                  </span>
                  <span>
                    <Smartphone size={14} /> Mobile ready
                  </span>
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
          Stats refresh from NodeBlink. Before your first sale, counts may read zero. That's expected.
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
                This demo shows the same checkout experience your audience sees when they open your link.
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
            <h3 style={{ margin: 0 }}>A creator page that shares well</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
              Your creator page is made to look great when shared, with clear buttons to pay or unlock.
            </p>
          </article>
          <article className="card stack" style={{ padding: 22 }}>
            <Smartphone size={22} color="var(--brand-start)" />
            <h3 style={{ margin: 0 }}>Mobile-friendly checkout</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
              Works smoothly on mobile, so fans can complete checkout without getting stuck in a browser.
            </p>
          </article>
          <article className="card stack" style={{ padding: 22 }}>
            <Wallet size={22} color="var(--brand-start)" />
            <h3 style={{ margin: 0 }}>SOL & USDC checkout</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
              Let your audience pay in SOL or USDC, and receive funds directly to your wallet.
            </p>
          </article>
          <article className="card stack" style={{ padding: 22 }}>
            <FileKey size={22} color="var(--brand-start)" />
            <h3 style={{ margin: 0 }}>Instant file unlocks</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
              Sell a file with a simple unlock flow. After payment, buyers can download what they bought.
            </p>
          </article>
          <article className="card stack" style={{ padding: 22 }}>
            <Sparkles size={22} color="var(--brand-start)" />
            <h3 style={{ margin: 0 }}>Link previews that convert</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
              Your link shows a clean preview in supported social apps and wallets, making it easy to buy.
            </p>
          </article>
          <article className="card stack" style={{ padding: 22 }}>
            <Server size={22} color="var(--brand-start)" />
            <h3 style={{ margin: 0 }}>Simple setup</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
              Connect your wallet, add your products, and start sharing. No coding needed.
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
                NodeBlink never holds your money. Buyers pay on Solana directly to your wallet. If you
                sell files, they stay locked until payment is confirmed.
              </p>
            </div>
            <div className="stack">
              <div className="card stack" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Shield size={18} color="var(--brand-start)" />
                  <strong>Secure file delivery</strong>
                </div>
                <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
                  Files stay locked and only unlock after payment is confirmed.
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
          Link previews on social
        </h2>
        <div className="grid-2" style={{ alignItems: "start" }}>
          <div className="card stack" style={{ padding: 22 }}>
            <h3 style={{ margin: 0 }}>What to share</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
              Share your creator page link so people see your profile and products in the preview.
            </p>
            <div className="product-row">
              <code style={{ wordBreak: "break-all" }}>{stats.domain}/creator/yourname</code>
            </div>
          </div>
          <div className="card stack" style={{ padding: 22 }}>
            <h3 style={{ margin: 0 }}>Where it shows up</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
              In supported apps (like X and Discord), your link expands into a preview your audience can
              tap to pay or unlock.
            </p>
            <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
              Best practice: share your creator page (not individual API or product links).
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
            A simple fee
          </h2>
          <p style={{ margin: 0, maxWidth: 560, lineHeight: 1.7, position: "relative", zIndex: 1 }}>
            There is no monthly subscription. A small fee is included in each payment. The live fee on
            this deployment is <strong>{stats.platformFeePercent}%</strong>.
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
