"use client";

import { PremiumCheckout } from "@/components/premium-checkout";
import { SolanaWalletProvider } from "@/components/wallet-provider";
import type { CreatorProfileView } from "@/lib/creator-actions";

type Props = {
  creator: CreatorProfileView;
  actionApiUrl: string;
  mobile: boolean;
};

export function CreatorCheckoutShell({ creator, actionApiUrl, mobile }: Props) {
  return (
    <SolanaWalletProvider>
      <PremiumCheckout creator={creator} actionApiUrl={actionApiUrl} mobile={mobile} />
    </SolanaWalletProvider>
  );
}
