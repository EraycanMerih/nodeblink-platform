import { BadgeCheck, Shield } from 'lucide-react';

type Props = {
  level: string;
  size?: 'sm' | 'md';
};

export function TrustBadge({ level, size = 'sm' }: Props) {
  if (level === 'UNVERIFIED') return null;

  const config: Record<string, { label: string; color: string; bg: string; border: string }> = {
    COMMUNITY: { label: 'Community verified', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.28)' },
    VERIFIED: { label: 'Verified creator', color: '#16a34a', bg: 'rgba(22,163,74,0.1)', border: 'rgba(22,163,74,0.24)' },
    FEATURED: { label: 'Featured creator', color: 'var(--brand-start)', bg: 'rgba(85,214,190,0.14)', border: 'rgba(85,214,190,0.28)' },
  };

  const c = config[level];
  if (!c) return null;

  const iconSize = size === 'sm' ? 13 : 16;
  const Icon = level === 'UNVERIFIED' ? Shield : BadgeCheck;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: size === 'sm' ? '4px 10px' : '6px 14px',
        borderRadius: 999,
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        fontSize: size === 'sm' ? 12 : 13,
        fontWeight: 600,
      }}
    >
      <Icon size={iconSize} />
      {c.label}
    </span>
  );
}
