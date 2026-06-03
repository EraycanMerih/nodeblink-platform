"use client";

import { PremiumCheckout } from "@/components/premium-checkout";
import { SolanaWalletProvider } from "@/components/wallet-provider";
import type { CreatorProfileView } from "@/lib/creator-actions";

type Props = {
  creator: CreatorProfileView;
  actionApiUrl: string;
  mobile: boolean;
  productId?: string;
};

export function CreatorCheckoutShell({ creator, actionApiUrl, mobile, productId }: Props) {
  return (
    <SolanaWalletProvider>
      <PremiumCheckout creator={creator} actionApiUrl={actionApiUrl} mobile={mobile} productId={productId} />
    </SolanaWalletProvider>
  );
}
