"use client";

import { useMemo, useState } from "react";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";

import { clusterApiUrl } from "@solana/web3.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, base, polygon } from "wagmi/chains";
import { injected, coinbaseWallet } from "wagmi/connectors";

// ─── WAGMI EVM CONFIG ────────────────────────────────────────────────────────
const wagmiConfig = createConfig({
  chains: [mainnet, base, polygon],
  connectors: [
    injected(),
    coinbaseWallet({ appName: "NodeBlink V3" }),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [polygon.id]: http(),
  },
});

export function UnifiedWalletProvider({ children }: { children: React.ReactNode }) {
  // Setup React Query for Wagmi
  const [queryClient] = useState(() => new QueryClient());

  // Setup Solana Adapters
  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("mainnet-beta"), []);
  const solanaWallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider endpoint={endpoint}>
          <SolanaWalletProvider wallets={solanaWallets} autoConnect={true}>
            <WalletModalProvider>
              {children}
            </WalletModalProvider>
          </SolanaWalletProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
