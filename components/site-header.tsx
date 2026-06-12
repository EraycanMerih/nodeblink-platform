import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/logo';

export function SiteHeader() {
  return (
    <header className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      <div
        className="shell"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
          gap: 16,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Logo size={56} />
        </Link>

        {/* Nav links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <div className="desktop-only" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Link
              href="/#pillars"
              className="btn-ghost"
              style={{
                fontSize: 14,
                fontWeight: 500,
                padding: '6px 12px',
                borderRadius: 8,
                transition: 'all 0.2s',
              }}
            >
              Features
            </Link>

            <Link
              href="/trust"
              className="btn-ghost"
              style={{
                fontSize: 14,
                fontWeight: 500,
                padding: '6px 12px',
                borderRadius: 8,
                transition: 'all 0.2s',
              }}
            >
              Trust API
            </Link>
            <Link
              href="/#pricing"
              className="btn-ghost"
              style={{
                fontSize: 14,
                fontWeight: 500,
                padding: '6px 12px',
                borderRadius: 8,
                transition: 'all 0.2s',
              }}
            >
              Pricing
            </Link>
            <div style={{ width: 1, height: 24, background: 'var(--color-line)', margin: '0 8px' }} />
          </div>
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="btn btn-primary"
            style={{ fontSize: 14, padding: '8px 18px', marginLeft: 8 }}
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
