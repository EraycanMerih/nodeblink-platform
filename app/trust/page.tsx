import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { TrustLookup } from '@/components/trust-lookup';
import type { Metadata } from 'next';
import { Shield, BadgeCheck, Code2, Copy, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Trust API Reference — NodeBlink',
  description: 'NodeBlink Trust API: Validate EVM and Solana wallet identities instantly.',
};

export default function TrustPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
      <SiteHeader />
      <main className="flex-1" style={{ paddingTop: 64 }}>
        <div className="shell" style={{ maxWidth: 1400 }}>
          
          <div className="hero-mesh" style={{ padding: '64px 40px', borderRadius: 32, marginBottom: 40, textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 600 }} className="stack">
              <span className="badge" style={{ width: 'fit-content', background: 'var(--color-panel)', border: '1px solid var(--color-line)', color: 'var(--text)' }}>
                <Shield size={13} style={{ color: 'var(--brand-start)' }}/> Trust Registry API
              </span>
              <h1 className="display" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.05, margin: 0 }}>
                Verify wallets.<br/>
                <span className="text-gradient">Stop fraud.</span>
              </h1>
              <p className="muted" style={{ margin: 0, fontSize: 18, lineHeight: 1.6 }}>
                The NodeBlink Trust API allows exchanges, dApps, and merchants to programmatically verify if an EVM or Solana address is linked to a verified real-world identity.
              </p>
            </div>
            
            <div style={{ position: 'relative', zIndex: 1, flex: 1, maxWidth: 450, width: '100%', background: 'color-mix(in srgb, var(--bg), transparent 20%)', backdropFilter: 'blur(16px)', borderRadius: 24, padding: 24, boxShadow: 'var(--shadow-premium)', overflow: 'hidden', border: '1px solid var(--color-line)' }} className="animate-rise">
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 12, height: 12, borderRadius: 6, background: 'color-mix(in srgb, var(--text), transparent 80%)' }}/>
                <div style={{ width: 12, height: 12, borderRadius: 6, background: 'color-mix(in srgb, var(--text), transparent 80%)' }}/>
                <div style={{ width: 12, height: 12, borderRadius: 6, background: 'color-mix(in srgb, var(--text), transparent 80%)' }}/>
              </div>
              <pre style={{ margin: 0, color: 'var(--text)', fontSize: 13, fontFamily: 'monospace', lineHeight: 1.6, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                <span style={{ color: 'var(--brand-start)' }}>$</span> curl https://api.nodeblink.com/v1/trust/0x...<br/>
                {`{
  "wallet": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "verified": true,
  "level": "VERIFIED",
  "identity": {
    "platform": "twitter",
    "handle": "@vitalik",
    "displayName": "Vitalik"
  }
}`}
              </pre>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 64, alignItems: 'start', paddingBottom: 80 }}>
            <div className="stack" style={{ gap: 48 }}>
              
              <section>
                <h2 className="display" style={{ fontSize: 28, margin: '0 0 16px' }}>The Verification Engine</h2>
                <p className="muted" style={{ fontSize: 16, lineHeight: 1.7, margin: '0 0 24px' }}>
                  NodeBlink aggregates OAuth integrations, on-chain attestations, and manual KYC to build a robust profile of an address. Query the engine to display verification badges natively in your UI.
                </p>
                
                <div className="grid-2" style={{ gap: 20 }}>
                  {[
                    { icon: Shield, title: "Fraud Prevention", desc: "Flag suspicious unverified addresses before they interact with your smart contracts." },
                    { icon: BadgeCheck, title: "Visual Trust", desc: "Render a blue checkmark next to verified wallets in your marketplace or swap." },
                    { icon: Code2, title: "Universal", desc: "Built to seamlessly support Solana (Base58) and all EVM-compatible chains (Hex)." },
                  ].map((Feature, i) => (
                    <div key={i} className="panel" style={{ padding: 24 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'color-mix(in srgb, var(--brand-start), transparent 85%)', color: 'var(--brand-ink)', display: 'grid', placeItems: 'center', marginBottom: 16 }}>
                        <Feature.icon size={20} />
                      </div>
                      <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>{Feature.title}</h3>
                      <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{Feature.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <hr style={{ border: 0, borderTop: '1px solid var(--color-line)' }} />

              <section>
                <h2 className="display" style={{ fontSize: 28, margin: '0 0 16px' }}>API Reference</h2>
                
                <div className="panel" style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-line)', background: 'color-mix(in srgb, var(--color-panel), transparent 30%)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 8px', borderRadius: 6, background: 'color-mix(in srgb, var(--brand-start), transparent 85%)', color: 'var(--brand-start)' }}>GET</span>
                    <code style={{ background: 'transparent', padding: 0, fontSize: 14, fontWeight: 500 }}>/api/v1/trust/[wallet]</code>
                  </div>
                  <div style={{ padding: 24 }}>
                    <p className="muted" style={{ margin: '0 0 20px', fontSize: 15 }}>Returns the trust and verification status for any given wallet address.</p>
                    
                    <h4 style={{ margin: '0 0 12px', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)' }}>Response Object</h4>
                    <div className="stack" style={{ gap: 12 }}>
                      {[
                        { field: 'wallet', type: 'string', desc: 'The queried wallet address.' },
                        { field: 'verified', type: 'boolean', desc: 'Whether the wallet has passed any form of verification.' },
                        { field: 'level', type: 'enum', desc: '"UNVERIFIED" | "COMMUNITY" | "VERIFIED" | "FEATURED"' },
                        { field: 'platform', type: 'string | null', desc: 'The social or identity platform used (e.g. "twitter").' },
                        { field: 'handle', type: 'string | null', desc: 'The verified username/handle on the platform.' },
                      ].map(f => (
                        <div key={f.field} style={{ display: 'flex', gap: 16, paddingBottom: 12, borderBottom: '1px solid var(--color-line)' }}>
                          <div style={{ width: 120 }}>
                            <code style={{ fontSize: 13, background: 'color-mix(in srgb, var(--color-panel), transparent 50%)', wordBreak: 'break-all' }}>{f.field}</code>
                          </div>
                          <div>
                            <span style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>{f.type}</span>
                            <span style={{ fontSize: 14 }}>{f.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

            </div>

            <div style={{ position: 'sticky', top: 100 }} className="stack">
              <div className="panel stack" style={{ padding: 24 }}>
                <h3 style={{ margin: 0, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={18} className="text-brand"/> Test the API</h3>
                <p className="muted" style={{ margin: 0, fontSize: 14 }}>Enter an address to run a live query against the Trust Registry.</p>
                <TrustLookup />
              </div>
              
              <div className="panel" style={{ padding: 24, background: 'color-mix(in srgb, var(--color-panel), transparent 20%)', color: 'var(--text)', border: '1px solid var(--color-line)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--text)' }}>Trust Levels</h3>
                <div className="stack" style={{ gap: 16 }}>
                  {[
                    { level: 'UNVERIFIED', color: 'var(--muted)' },
                    { level: 'COMMUNITY', color: 'color-mix(in srgb, var(--brand-start), var(--text) 50%)' },
                    { level: 'VERIFIED', color: 'var(--brand-start)' },
                    { level: 'FEATURED', color: 'var(--brand-end)' },
                  ].map(t => (
                    <div key={t.level} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <CheckCircle2 size={16} color={t.color} />
                      <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.05em' }}>{t.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
