"use client";

import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Loader2 } from "lucide-react";

type Props = {
  className?: string;
};

export function WalletConnectButton({ className = "btn btn-primary" }: Props) {
  const [mounted, setMounted] = useState(false);

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

  return <WalletMultiButton className={className} />;
}
