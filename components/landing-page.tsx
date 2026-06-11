"use client";

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  Globe2,
  Shield,
  Shuffle,
  Wallet,
  Zap,
  TrendingUp,
} from 'lucide-react';
import type { PublicProtocolStats } from '@/lib/public-stats';
import { SUPPORT_EMAIL } from '@/lib/brand';

type Props = { stats: PublicProtocolStats };

const PILLARS = [
  {
    icon: CreditCard,
    title: 'Universal Settlement',
    subtitle: 'Pillar 1',
    description: 'One link. Your audience pays however they prefer — credit card via Stripe or crypto via any major wallet. Zero split audience.',
  },
  {
    icon: Shuffle,
    title: 'Neutral Routing Layer',
    subtitle: 'Pillar 2',
    description: 'NodeBlink sits above wallets. Phantom, Solflare, MetaMask, Coinbase — payers choose. We route. You get paid.',
  },
  {
    icon: Shield,
    title: 'Open Trust Registry',
    subtitle: 'Pillar 3',
    description: 'Public identity layer mapping wallets to verified real-world profiles. An open API other dApps query to protect users.',
  },
];

const COMPARISON = [
  { feature: 'Fiat + Crypto payments', nodeblink: true, upwork: false, kofi: false, helio: false },
  { feature: 'Platform fee', nodeblink: 'Flat 2.5%', upwork: '10% – 20%', kofi: '3% – 5%', helio: '1% – 2%' },
  { feature: 'Multi-wallet routing', nodeblink: true, upwork: false, kofi: false, helio: false },
  { feature: 'Trust Registry API', nodeblink: true, upwork: false, kofi: false, helio: false },
  { feature: 'Non-custodial', nodeblink: true, upwork: false, kofi: false, helio: true },
];

const FAQS = [
  { q: 'Can I accept both card payments and crypto?', a: 'Yes. Your NodeBlink link shows payers a choice: Pay via Card (Stripe) or Pay via Wallet (Phantom, Solflare, MetaMask). You get paid either way.' },
  { q: 'What is the Trust Registry?', a: 'NodeBlink maps verified social identities (Twitter, GitHub, YouTube) to wallet addresses. When wallets and dApps query our open API, they can show buyers who they are actually paying.' },
  { q: 'Do you hold my funds?', a: 'Never. Crypto payments go directly to your wallet. Card payments settle via Stripe Connect directly to your bank account. NodeBlink never holds funds.' },
  { q: 'What are the fees?', a: 'We charge a flat 2.5% protocol fee on all transactions. For fiat payments, standard Stripe processing fees also apply. Trust API has a free tier + enterprise.' },
];

export function LandingPage({ stats }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const volumeLabel = stats.volumeSol > 0 ? `${stats.volumeSol.toFixed(2)} SOL` : '0 SOL';

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="shell animate-rise" style={{ padding: '40px 0 64px' }}>
        <div className="hero-mesh">
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            
            {/* Pillar badge strip */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              <span className="badge">
                <Globe2 size={14} /> Live on {stats.network}
              </span>
              <span className="badge" style={{ background: 'var(--color-ink)', color: 'var(--bg)', borderColor: 'var(--color-ink)' }}>
                <Zap size={14} /> v3.0 — Universal Payment Protocol
              </span>
            </div>

            <h1
              className="display"
              style={{
                fontSize: 'clamp(3rem, 7vw, 5.2rem)',
                lineHeight: 1.05,
                margin: 0,
                maxWidth: 900,
              }}
            >
              Share one link.<br />
              <span className="text-gradient">Get paid in anything.</span>
            </h1>

            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', lineHeight: 1.6, margin: 0, maxWidth: 640, color: 'var(--muted)', fontWeight: 400 }}>
              NodeBlink is a universal payment routing protocol. Accept crypto <em>and</em> cards from one link. Verify your identity on the Open Trust Registry.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 16, justifyContent: 'center' }}>
              <Link href="/dashboard" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: 16 }}>
                Open Creator Studio <ArrowRight size={18} />
              </Link>
              <Link href="/pay/demo" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: 16 }}>
                Try live demo
              </Link>
            </div>

            {/* Trust strip */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', color: 'var(--muted)', fontSize: 14, marginTop: 32, fontWeight: 500 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BadgeCheck size={16} color="var(--brand-start)" /> {stats.feeRangeLabel} protocol fee</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Shield size={16} color="var(--brand-start)" /> Non-custodial</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CreditCard size={16} color="var(--brand-start)" /> Fiat + Crypto</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats counter strip ──────────────────────────────────────────── */}
      <section className="shell" style={{ paddingBottom: 96 }}>
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {[
            { label: 'Registered creators', value: stats.creators || '—' },
            { label: 'Active products', value: stats.products || '—' },
            { label: 'Confirmed payments', value: stats.confirmedPayments || '—' },
            { label: 'Volume processed', value: volumeLabel },
          ].map((stat) => (
            <div key={stat.label} className="panel" style={{ padding: 24, textAlign: 'center' }}>
              <span className="muted" style={{ fontSize: 14, fontWeight: 500, letterSpacing: '0.02em' }}>{stat.label}</span>
              <strong style={{ display: 'block', fontSize: 32, marginTop: 8, fontFamily: 'var(--font-display)' }}>{stat.value}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pillars Bento Grid ──────────────────────────────────────────── */}
      <section id="pillars" className="shell stack" style={{ paddingBottom: 96, gap: 40 }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }} className="stack">
          <span className="badge" style={{ alignSelf: 'center' }}>The Protocol</span>
          <h2 className="display section-title">Not just a payment link. A protocol.</h2>
          <p className="muted" style={{ margin: 0, fontSize: 17, lineHeight: 1.6 }}>
            NodeBlink evolves the payment link into a comprehensive payment surface.
          </p>
        </div>
        
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article key={pillar.title} className="card bento-hover stack" style={{ padding: 32 }}>
                <div className="feature-icon" style={{ background: 'color-mix(in srgb, var(--brand-start), transparent 85%)', color: 'var(--brand-start)' }}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="muted" style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {pillar.subtitle}
                  </p>
                  <h3 style={{ margin: 0, fontSize: 20 }}>{pillar.title}</h3>
                </div>
                <p className="muted" style={{ margin: 0, lineHeight: 1.6, fontSize: 15 }}>
                  {pillar.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Competitive comparison table ─────────────────────────────────── */}
      <section id="compare" className="shell stack" style={{ paddingBottom: 96, gap: 40 }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }} className="stack">
          <h2 className="display section-title">Why NodeBlink wins</h2>
          <p className="muted" style={{ margin: 0, fontSize: 17, lineHeight: 1.6 }}>
            Compared to existing tools, NodeBlink is the only platform that handles fiat + crypto + trust in one protocol.
          </p>
        </div>
        
        <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
            <thead>
              <tr>
                {['Feature', 'NodeBlink', 'Upwork / Fiverr', 'Ko-fi / Stripe', 'Helio / Crypto'].map((h, i) => (
                  <th key={h} style={{
                      padding: '20px 24px', textAlign: i === 0 ? 'left' : 'center',
                      borderBottom: '1px solid var(--color-line)', fontWeight: 600, fontSize: 14,
                      color: i === 1 ? 'var(--brand-start)' : 'var(--text)',
                      background: i === 1 ? 'color-mix(in srgb, var(--brand-start), transparent 85%)' : 'transparent',
                    }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, index) => (
                <tr key={row.feature} style={{ borderBottom: index === COMPARISON.length - 1 ? 'none' : '1px solid var(--color-line)' }}>
                  <td style={{ padding: '20px 24px', fontWeight: 600, color: 'var(--text)' }}>
                    {row.feature}
                  </td>
                  {[row.nodeblink, row.upwork, row.kofi, row.helio].map((val, ci) => (
                    <td key={ci} style={{
                        padding: '20px 24px', textAlign: 'center',
                        background: ci === 0 ? 'color-mix(in srgb, var(--brand-start), transparent 94%)' : 'transparent',
                        color: val === true ? 'var(--brand-start)' : val === false ? 'var(--color-line)' : 'var(--text)',
                        fontWeight: ci === 0 ? 600 : 500,
                      }}>
                      {val === true ? <CheckCircle2 size={20} style={{ display: 'inline' }} /> : val === false ? '–' : (val as string)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────── */}
      <section id="pricing" className="shell stack" style={{ paddingBottom: 96, gap: 40 }}>
        <h2 className="display section-title" style={{ margin: 0, textAlign: 'center' }}>Simple, fair pricing</h2>
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {[
            { product: 'NodeBlink Pay (Crypto)', fee: 'Flat 2.0%', note: '2.0% base fee. 1.5% custom fee for large creators.', icon: Wallet },
            { product: 'NodeBlink Pay (Fiat)', fee: 'Stripe + 2.0%', note: 'Standard Stripe processing + 2.0% routing margin.', icon: CreditCard },
            { product: 'Trust API', fee: 'Free / Enterprise', note: 'Free tier for standard queries. Enterprise licensing available.', icon: Shield },
          ].map((tier) => {
            const Icon = tier.icon;
            return (
              <article key={tier.product} className="card bento-hover stack" style={{ padding: 32 }}>
                <div className="feature-icon" style={{ background: 'color-mix(in srgb, var(--text), transparent 94%)', color: 'var(--text)', border: 'none' }}>
                  <Icon size={24} />
                </div>
                <div style={{ marginTop: 8 }}>
                  <p className="muted" style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {tier.product}
                  </p>
                  <p style={{ margin: '8px 0 0', fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>
                    {tier.fee}
                  </p>
                </div>
                <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
                  {tier.note}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────── */}
      <section className="shell" style={{ paddingBottom: 96 }}>
        <div className="panel stack" style={{ alignItems: 'center', padding: '80px 40px', background: 'var(--color-panel)' }}>
          <span className="badge" style={{ background: 'color-mix(in srgb, var(--brand-start), transparent 80%)', color: 'var(--brand-start)', borderColor: 'transparent' }}>
            <TrendingUp size={14} /> The open standard
          </span>
          <h2 className="display" style={{ margin: '8px 0 0', fontSize: 'clamp(2.4rem, 5vw, 4rem)', maxWidth: 800, textAlign: 'center' }}>
            The single link for global commerce.
          </h2>
          <p className="muted" style={{ margin: '16px 0 0', maxWidth: 640, lineHeight: 1.6, fontSize: 18, textAlign: 'center' }}>
            Join the protocol powering the next generation of creator payments and trusted on-chain identity.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 32, justifyContent: 'center' }}>
            <Link href="/dashboard" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: 16 }}>
              Open Creator Studio <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="shell stack" style={{ paddingBottom: 120, maxWidth: 800 }}>
        <h2 className="display" style={{ fontSize: 32, margin: '0 0 24px', textAlign: 'center' }}>
          Frequently asked questions
        </h2>
        <div className="stack" style={{ gap: 12 }}>
          {FAQS.map((item, i) => (
            <details
              key={item.q}
              className="faq-item"
              open={openFaq === i}
              onClick={(e) => {
                e.preventDefault();
                setOpenFaq(openFaq === i ? null : i);
              }}
            >
              <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {item.q}
                <span style={{ color: 'var(--muted)', fontSize: 20, fontWeight: 300 }}>{openFaq === i ? '−' : '+'}</span>
              </summary>
              {openFaq === i && (
                <p className="muted" style={{ margin: '16px 0 0', lineHeight: 1.6, fontSize: 15 }}>
                  {item.a}
                </p>
              )}
            </details>
          ))}
        </div>
        <p className="muted" style={{ margin: '24px 0 0', textAlign: 'center', fontSize: 15 }}>
          Need help? Contact support at <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--text)', textDecoration: 'underline' }}>{SUPPORT_EMAIL}</a>.
        </p>
      </section>
    </main>
  );
}
