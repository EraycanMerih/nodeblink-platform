"use client";

import { useEffect, useState, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Loader2, ChevronDown, LogOut } from "lucide-react";

type Props = {
  className?: string;
  style?: React.CSSProperties;
};

const EthereumIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.999 15.3441L5.6543 11.6022L11.999 24L18.3436 11.6022L11.999 15.3441Z" fill="#3B82F6"/>
    <path d="M11.999 0L5.6543 10.4903L11.999 14.2323L18.3436 10.4903L11.999 0Z" fill="#60A5FA"/>
  </svg>
);

const SolanaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.09241 17.5147C3.96781 17.7287 4.12192 18 4.36979 18H18.7844C18.995 18 19.1866 17.8864 19.2801 17.7029L20.2523 15.7958C20.3769 15.5818 20.2228 15.3105 19.975 15.3105H5.5603C5.34963 15.3105 5.1581 15.4241 5.06456 15.6076L4.09241 17.5147Z" fill="#14F195"/>
    <path d="M20.2524 8.20417C20.377 7.99021 20.2229 7.71887 19.9751 7.71887H5.56041C5.34975 7.71887 5.15822 7.8325 5.06468 8.01602L4.09253 9.92312C3.96792 10.1371 4.12204 10.4084 4.3699 10.4084H18.7846C18.9952 10.4084 19.1868 10.2948 19.2803 10.1113L20.2524 8.20417Z" fill="#9945FF"/>
    <path d="M4.09241 13.5606C3.96781 13.7746 4.12192 14.0459 4.36979 14.0459H18.7844C18.995 14.0459 19.1866 13.9323 19.2801 13.7488L20.2523 11.8416C20.3769 11.6277 20.2228 11.3563 19.975 11.3563H5.5603C5.34963 11.3563 5.1581 11.4699 5.06456 11.6535L4.09241 13.5606Z" fill="#14F195"/>
  </svg>
);

export function WalletConnectButton({ className = "btn btn-primary", style }: Props) {
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Solana
  const { connected: solConnected, disconnect: solDisconnect, publicKey } = useWallet();
  const { setVisible: setSolVisible } = useWalletModal();

  // EVM (wagmi)
  const { isConnected: evmConnected, address: evmAddress } = useAccount();
  const { connectAsync: evmConnectAsync, connectors } = useConnect();
  const { disconnect: evmDisconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <button type="button" className={className} style={{ ...style, opacity: 0.8 }} disabled>
        <Loader2 size={16} className="animate-spin" /> Loading
      </button>
    );
  }

  const anyConnected = solConnected || evmConnected;
  
  let shortAddress = "";
  if (solConnected && publicKey) {
    const b58 = publicKey.toBase58();
    shortAddress = `${b58.slice(0, 4)}...${b58.slice(-4)}`;
  } else if (evmConnected && evmAddress) {
    shortAddress = `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}`;
  }

  const handleDisconnect = () => {
    if (solConnected) solDisconnect();
    if (evmConnected) evmDisconnect();
    setDropdownOpen(false);
  };

  const openSolana = () => {
    setDropdownOpen(false);
    setSolVisible(true);
  };

  const openEvm = async () => {
    setDropdownOpen(false);
    if (connectors[0]) {
      try {
        await evmConnectAsync({ connector: connectors[0] });
      } catch (err) {
        console.error("EVM Connect error", err);
      }
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={containerRef}>
      <button
        type="button"
        className={className}
        style={{ ...style, display: 'flex', alignItems: 'center', gap: 8 }}
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {anyConnected ? (
          <>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            {shortAddress}
            <ChevronDown size={14} style={{ opacity: 0.5 }} />
          </>
        ) : (
          "Connect Wallet"
        )}
      </button>

      {dropdownOpen && (
        <div 
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            width: 240, background: 'var(--color-panel)', border: '1px solid var(--color-line)',
            borderRadius: 16, padding: 8, zIndex: 99999,
            boxShadow: 'var(--shadow-premium)',
            display: 'flex', flexDirection: 'column', gap: 4
          }}
        >
          {anyConnected ? (
            <>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-line)', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Connected</span>
                <strong style={{ display: 'block', fontSize: 14, marginTop: 4, wordBreak: 'break-all' }}>
                  {publicKey?.toBase58() || evmAddress}
                </strong>
              </div>
              <button 
                type="button"
                onClick={handleDisconnect}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  background: 'transparent', border: 'none', borderRadius: 10,
                  cursor: 'pointer', textAlign: 'left', color: '#EF4444', fontSize: 14, fontWeight: 500
                }}
                onMouseOver={e => e.currentTarget.style.background = 'color-mix(in srgb, #EF4444, transparent 90%)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={16} /> Disconnect
              </button>
            </>
          ) : (
             <>
              <div style={{ padding: '8px 12px' }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select Network</span>
              </div>
              
              <button 
                type="button"
                onClick={openSolana}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  background: 'transparent', border: 'none', borderRadius: 10,
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s ease'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--color-line), transparent 50%)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <SolanaIcon />
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Solana</span>
              </button>

              <button 
                type="button"
                onClick={openEvm}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  background: 'transparent', border: 'none', borderRadius: 10,
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s ease'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'color-mix(in srgb, var(--color-line), transparent 50%)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <EthereumIcon />
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Ethereum / Base</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
