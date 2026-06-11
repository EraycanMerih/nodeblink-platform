import { SiteFooter } from "@/components/site-footer";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { UnifiedWalletProvider } from "@/components/unified-wallet-provider";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UnifiedWalletProvider>
      <DashboardHeader />
      <DashboardShell>{children}</DashboardShell>
      <SiteFooter />
    </UnifiedWalletProvider>
  );
}

