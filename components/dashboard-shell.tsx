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
  { href: "/dashboard", label: "Studio", icon: <LayoutGrid size={16} /> },
  { href: "/dashboard/analytics", label: "Analytics", icon: <BarChart3 size={16} /> },
  { href: "/dashboard/settings", label: "Settings", icon: <Settings size={16} /> },
  { href: "/dashboard/admin", label: "Admin", icon: <Shield size={16} /> },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="shell" style={{ padding: "22px 0 64px" }}>
      <div className="dashboard-grid">
        <aside className="panel dashboard-sidebar" style={{ padding: 16 }}>
          <div className="stack" style={{ gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div className="display" style={{ fontSize: 18 }}>
                Dashboard
              </div>
              <ThemeToggle className="btn btn-secondary" />
            </div>

            <nav className="stack" style={{ gap: 8 }}>
              {NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="btn btn-secondary"
                    style={{
                      justifyContent: "flex-start",
                      gap: 10,
                      borderColor: active ? "rgba(14, 237, 181, 0.55)" : undefined,
                      boxShadow: active ? "0 10px 28px rgba(14, 237, 181, 0.14)" : undefined,
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="card stack" style={{ padding: 14 }}>
              <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
                Connect a wallet to manage your creator profile and products.
              </p>
              <WalletConnectButton className="btn btn-primary" />
            </div>
          </div>
        </aside>

        <div className="stack" style={{ gap: 18 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
