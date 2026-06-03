import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Globe2,
  Link2,
  ShieldCheck,
  Smartphone,
  Wallet,
  Server,
  FileKey,
} from "lucide-react";
import type { PublicProtocolStats } from "@/lib/public-stats";
import { SUPPORT_EMAIL } from "@/lib/brand";

type Props = {
  stats: PublicProtocolStats;
};

function getFaqs() {
  return [
    {
      q: "Do you hold my funds?",
      a: "No. NodeBlink is non-custodial. Your audience pays on Solana directly to your wallet.",
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
  const faqs = getFaqs();
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
                Sell tips, files, and access passes on Solana with a wallet-native checkout.
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
                <div
                  style={{
                    width: "100%",
                    borderRadius: 18,
                    border: "1px solid var(--color-line)",
                    background:
                      "radial-gradient(900px 260px at 20% 0%, rgba(99, 91, 255, 0.22), transparent 60%), radial-gradient(800px 240px at 80% 0%, rgba(154, 123, 255, 0.18), transparent 65%), color-mix(in srgb, var(--color-panel), transparent 6%)",
                    padding: 16,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <strong style={{ fontSize: 14 }}>Creator Studio</strong>
                    <span className="badge">Analytics</span>
                  </div>
                  <div className="stat-grid" style={{ marginTop: 12 }}>
                    <div className="stat">
                      <span className="muted">Volume</span>
                      <strong>12.4 SOL</strong>
                    </div>
                    <div className="stat">
                      <span className="muted">Payments</span>
                      <strong>38</strong>
                    </div>
                    <div className="stat">
                      <span className="muted">Products</span>
                      <strong>4</strong>
                    </div>
                    <div className="stat">
                      <span className="muted">Confirmed</span>
                      <strong>36</strong>
                    </div>
                  </div>
                  <div className="stack" style={{ gap: 10, marginTop: 12 }}>
                    <div className="product-row" style={{ padding: 12, borderRadius: 14 }}>
                      <div>
                        <strong>Monthly access</strong>
                        <p className="muted" style={{ margin: "4px 0 0", fontSize: 12 }}>
                          access pass
                        </p>
                      </div>
                      <span className="badge">0.75 SOL</span>
                    </div>
                    <div className="product-row" style={{ padding: 12, borderRadius: 14 }}>
                      <div>
                        <strong>Strategy pack</strong>
                        <p className="muted" style={{ margin: "4px 0 0", fontSize: 12 }}>
                          gated pdf
                        </p>
                      </div>
                      <span className="badge">1.25 SOL</span>
                    </div>
                  </div>
                </div>
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

      <section id="features" className="shell stack" style={{ padding: "8px 0 56px" }}>
        <h2 className="display" style={{ fontSize: 32, margin: 0 }}>
          What you get
        </h2>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
          <article className="card stack" style={{ padding: 22 }}>
            <Smartphone size={22} color="var(--brand-start)" />
            <h3 style={{ margin: 0 }}>Mobile-friendly checkout</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
              Works smoothly on mobile, so fans can complete checkout without getting stuck in a browser.
            </p>
          </article>
          <article className="card stack" style={{ padding: 22 }}>
            <Wallet size={22} color="var(--brand-start)" />
            <h3 style={{ margin: 0 }}>Non-custodial payments</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
              Fans pay directly to your wallet. NodeBlink never holds funds.
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
            <Server size={22} color="var(--brand-start)" />
            <h3 style={{ margin: 0 }}>Simple setup</h3>
            <p className="muted" style={{ margin: 0, lineHeight: 1.65 }}>
              Connect your wallet, add your products, and start sharing. No coding needed.
            </p>
          </article>
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
