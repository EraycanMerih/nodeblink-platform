import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { DashboardStudio } from "@/components/dashboard-studio";
import { SolanaWalletProvider } from "@/components/wallet-provider";
import { SOLANA_RPC_URL } from "@/lib/env";

export const metadata = {
  title: "Creator Studio",
};

export default function DashboardPage() {
  return (
    <SolanaWalletProvider endpoint={SOLANA_RPC_URL}>
      <SiteHeader />
      <DashboardStudio />
      <SiteFooter />
    </SolanaWalletProvider>
  );
}
