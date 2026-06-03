"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Loader2 } from "lucide-react";

type Props = {
  className?: string;
};

export function WalletConnectButton({ className = "btn btn-primary" }: Props) {
  const [mounted, setMounted] = useState(false);
  const { connected, connect, disconnect, wallet } = useWallet();
  const { setVisible } = useWalletModal();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button type="button" className={className} disabled>
        <Loader2 size={16} className="animate-spin" /> Loading wallets…
      </button>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (connected) {
          disconnect();
          return;
        }
        if (wallet) {
          connect();
          return;
        }
        setVisible(true);
      }}
    >
      {connected ? "Disconnect wallet" : "Connect wallet"}
    </button>
  );
}
