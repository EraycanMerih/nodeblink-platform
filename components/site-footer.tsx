import Link from 'next/link';
import { getRequestOrigin } from '@/lib/request-origin';
import { SUPPORT_EMAIL } from '@/lib/brand';
import { PLATFORM_FEE_PERCENT } from '@/lib/env';
import { Logo } from '@/components/logo';

export async function SiteFooter() {
  const origin = await getRequestOrigin();
  const domain = origin.replace(/^https?:\/\//, '');

  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-line)',
        padding: '64px 0 40px',
        background: 'var(--color-panel)',
      }}
    >
      <div className="shell">
        {/* Four-column link grid */}
        <div
          style={{
            display: 'grid',
            gap: 48,
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            marginBottom: 64,
          }}
        >
          {/* Brand */}
          <div className="stack" style={{ gap: 16 }}>
            <Link
              href="/"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 18,
                letterSpacing: '-0.02em',
                color: 'var(--text)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Logo size={28} />
              NodeBlink
            </Link>
            <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>
              Universal payment routing protocol for the open internet. Share one link. Get paid in
              anything.
            </p>
            <p className="muted" style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>
              {domain} · {PLATFORM_FEE_PERCENT}% protocol fee
            </p>
          </div>

          {/* Products */}
          <div className="stack" style={{ gap: 12 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>Products</p>
            {[
              { label: 'Creator Studio', href: '/dashboard' },
              { label: 'Universal Pay', href: '/pay/demo' },
              { label: 'Trust Registry', href: '/trust' },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="muted" style={{ fontSize: 14, transition: 'color 0.2s' }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Developers */}
          <div className="stack" style={{ gap: 12 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>Developers</p>
            {[
              { label: 'Actions JSON', href: '/actions.json' },
              { label: 'Trust API', href: '/api/v1/trust/demo' },
              { label: 'Health Check', href: '/api/health' },
              { label: 'Demo Creator', href: '/pay/demo' },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="muted" style={{ fontSize: 14, transition: 'color 0.2s' }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Support */}
          <div className="stack" style={{ gap: 12 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>Support</p>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="muted" style={{ fontSize: 14, transition: 'color 0.2s' }}>
              {SUPPORT_EMAIL}
            </a>
            <Link href="/pay/demo" className="muted" style={{ fontSize: 14, transition: 'color 0.2s' }}>
              Live demo
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid var(--color-line)',
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <p className="muted" style={{ margin: 0, fontSize: 13 }}>
            © {new Date().getFullYear()} NodeBlink. Non-custodial. Open protocol.
          </p>
          <p className="muted" style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>
            Solana mainnet · Stripe Connect · Open Trust Registry
          </p>
        </div>
      </div>
    </footer>
  );
}
