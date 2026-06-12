"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LayoutGrid, Settings, Shield } from "lucide-react";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import { ThemeToggle } from "@/components/theme-toggle";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: <LayoutGrid size={16} /> },
  { href: "/dashboard/analytics", label: "Analytics", icon: <BarChart3 size={16} /> },
  { href: "/trust", label: "Trust API", icon: <Shield size={16} /> },
  { href: "/dashboard/settings", label: "Settings", icon: <Settings size={16} /> },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="shell" style={{ padding: "32px 0 64px" }}>
      <div className="dashboard-grid">
        <aside className="dashboard-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 32, zIndex: 50 }}>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="display" style={{ fontSize: 20, fontWeight: 600 }}>
              Creator Studio
            </span>
            <ThemeToggle />
          </div>

          <nav className="stack" style={{ gap: 4 }}>
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 500,
                    color: active ? 'var(--text)' : 'var(--muted)',
                    background: active ? 'var(--color-panel)' : 'transparent',
                    border: active ? '1px solid var(--color-line)' : '1px solid transparent',
                    boxShadow: active ? '0 1px 2px rgba(0,0,0,0.02)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ color: active ? 'var(--brand-start)' : 'var(--muted)' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
              Connect your wallet to manage your creator profile, products, and analytics.
            </p>
            <WalletConnectButton className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} />
          </div>
        </aside>

        <div className="stack" style={{ gap: 32 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
