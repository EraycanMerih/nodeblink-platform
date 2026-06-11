"use client";

type Props = {
  actionApiUrl: string;
  username: string;
};

export function WalletSelectorGrid({ actionApiUrl, username }: Props) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const encodedUsername = encodeURIComponent(username);

  const wallets = [
    {
      name: 'Phantom',
      description: 'Open in Phantom wallet',
      deepLink: `phantom://browse/${origin.replace(/^https?:\/\//, '')}/pay/${encodedUsername}`,
      color: '#ab9ff2',
      bg: 'rgba(171,159,242,0.12)',
    },
    {
      name: 'Solflare',
      description: 'Open in Solflare wallet',
      deepLink: `solflare://ul/v1/browse/${encodeURIComponent(`${origin}/pay/${encodedUsername}`)}?ref=${encodeURIComponent(origin)}`,
      color: '#f07827',
      bg: 'rgba(240,120,39,0.12)',
    },
    {
      name: 'MetaMask',
      description: 'Open in MetaMask (EVM routing)',
      deepLink: `metamask://`,
      color: '#e2761b',
      bg: 'rgba(226,118,27,0.12)',
    },
    {
      name: 'Coinbase',
      description: 'Open in Coinbase Wallet',
      deepLink: `cbwallet://dapp?url=${encodeURIComponent(`${origin}/pay/${encodedUsername}`)}`,
      color: '#0052ff',
      bg: 'rgba(0,82,255,0.1)',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gap: 10,
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      }}
    >
      {wallets.map((wallet) => (
        <a
          key={wallet.name}
          href={wallet.deepLink}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: '16px',
            borderRadius: 14,
            border: `1px solid ${wallet.color}33`,
            background: wallet.bg,
            textDecoration: 'none',
            color: 'var(--text)',
            transition: 'box-shadow 0.15s, transform 0.15s',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${wallet.color}22`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = '';
            (e.currentTarget as HTMLElement).style.boxShadow = '';
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `${wallet.color}1a`,
              display: 'grid',
              placeItems: 'center',
              fontSize: 18,
              fontWeight: 700,
              color: wallet.color,
              fontFamily: 'var(--font-display)',
            }}
          >
            {wallet.name[0]}
          </div>
          <div>
            <strong style={{ fontSize: 14, display: 'block' }}>{wallet.name}</strong>
            <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{wallet.description}</span>
          </div>
        </a>
      ))}
    </div>
  );
}
