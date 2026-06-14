"use client";

type Props = {
  actionApiUrl: string;
  username: string;
};

export function WalletSelectorGrid({ actionApiUrl, username }: Props) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const encodedUsername = encodeURIComponent(username);
  
  // The full URL the wallet should open
  const targetUrl = origin ? `${origin}/pay/${encodedUsername}` : `https://nodeblink.dev/pay/${encodedUsername}`;
  const encodedTarget = encodeURIComponent(targetUrl);

  const wallets = [
    {
      name: 'Phantom',
      description: 'Open in Phantom wallet',
      deepLink: `https://phantom.app/ul/browse/${encodedTarget}`,
      color: '#ab9ff2',
      bg: 'rgba(171,159,242,0.12)',
    },
    {
      name: 'Solflare',
      description: 'Open in Solflare wallet',
      deepLink: `https://solflare.com/ul/v1/browse/${encodedTarget}?ref=${encodeURIComponent(origin || 'https://nodeblink.dev')}`,
      color: '#f07827',
      bg: 'rgba(240,120,39,0.12)',
    },
    {
      name: 'MetaMask',
      description: 'Open in MetaMask (EVM routing)',
      deepLink: `https://metamask.app.link/dapp/${targetUrl.replace(/^https?:\/\//, '')}`,
      color: '#e2761b',
      bg: 'rgba(226,118,27,0.12)',
    },
    {
      name: 'Coinbase',
      description: 'Open in Coinbase Wallet',
      deepLink: `https://go.cb-w.com/dapp?cb_url=${encodedTarget}`,
      color: '#0052ff',
      bg: 'rgba(0,82,255,0.1)',
    },
  ];

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Open in Wallet App</h4>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>Securely route this checkout to your preferred mobile wallet.</p>
      </div>

      <div className="stack" style={{ gap: 10 }}>
        {wallets.map((wallet) => (
          <a
            key={wallet.name}
            href={wallet.deepLink}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '16px',
              borderRadius: 16,
              border: `1px solid var(--color-line)`,
              background: 'var(--color-panel)',
              textDecoration: 'none',
              color: 'var(--text)',
              transition: 'background 0.2s',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.background = wallet.bg;
              (e.currentTarget as HTMLElement).style.borderColor = `${wallet.color}40`;
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--color-panel)';
              (e.currentTarget as HTMLElement).style.borderColor = `var(--color-line)`;
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: `${wallet.color}1a`,
                display: 'grid',
                placeItems: 'center',
                fontSize: 20,
                fontWeight: 700,
                color: wallet.color,
                fontFamily: 'var(--font-display)',
                flexShrink: 0
              }}
            >
              {wallet.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: 15, display: 'block', fontWeight: 600 }}>{wallet.name}</strong>
              <span style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginTop: 2 }}>{wallet.description}</span>
            </div>
            <div style={{ color: "var(--muted)", opacity: 0.5 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
