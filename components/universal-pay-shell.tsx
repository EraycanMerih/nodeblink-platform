"use client";

import { useState } from 'react';
import { CreditCard, Wallet, ArrowRight, Loader2, Shield, CheckCircle2, Sparkles, Box } from 'lucide-react';
import { SolanaWalletProvider } from '@/components/wallet-provider';
import { PremiumCheckout } from '@/components/premium-checkout';
import { WalletSelectorGrid } from '@/components/wallet-selector-grid';
import type { CreatorProfileView } from '@/lib/creator-actions';

type PaymentMode = 'choose' | 'crypto' | 'card';

interface Props {
  creator: CreatorProfileView;
  actionApiUrl: string;
  mobile: boolean;
  productId?: string;
  isEmbed?: boolean;
}

export function UniversalPayShell({ creator, actionApiUrl, mobile, productId, isEmbed }: Props) {
  const [mode, setMode] = useState<PaymentMode>('choose');
  const [cardLoading, setCardLoading] = useState(false);
  const [cardStatus, setCardStatus] = useState<string | null>(null);

  const handleCardPay = async (prodId: string) => {
    setCardLoading(true);
    setCardStatus('Preparing card checkout…');
    try {
      const response = await fetch('/api/v1/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: 'card-buyer',
          productId: prodId,
          successUrl: `${window.location.href}?payment=success`,
          cancelUrl: window.location.href,
        }),
      });
      const data = await response.json() as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error ?? 'Card checkout unavailable');
      window.location.href = data.url;
    } catch (err) {
      setCardStatus(err instanceof Error ? err.message : 'Card checkout unavailable');
    } finally {
      setCardLoading(false);
    }
  };

  const displayProduct = productId
    ? creator.products.find((p) => p.id === productId)
    : creator.products[0]; // Highlight the first or specific product

  return (
    <SolanaWalletProvider>
      <div className="immersive-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>
      
      <main className="shell animate-rise" style={{ padding: isEmbed ? '16px 0 16px' : '60px 0 100px', position: 'relative', zIndex: 10, maxWidth: 900 }}>
        {/* State-of-the-art Glassmorphic Widget Container */}
        <div className="widget-container">
          
          {/* Header Section */}
          <header className="widget-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <img
                src={creator.avatarUrl && !creator.avatarUrl.endsWith('.svg') ? creator.avatarUrl : `/api/v1/creators/avatar-image?fallback`}
                alt=""
                className="widget-avatar"
              />
              <div className="stack" style={{ gap: 2 }}>
                <h1 className="widget-title">
                  {creator.displayName}
                  {creator.featured && <CheckCircle2 size={18} color="var(--brand-start)" style={{ display: 'inline', marginLeft: 6 }} />}
                </h1>
                <p className="muted" style={{ margin: 0, fontSize: 15 }}>@{creator.username}</p>
              </div>
            </div>
            <div className="trust-badges">
              <span><Shield size={14} /> Encrypted</span>
            </div>
          </header>

          <div className="widget-body">
            {/* Product Feature Area */}
            {displayProduct && (
              <div className="product-hero">
                {displayProduct.imageUrl ? (
                  <img src={displayProduct.imageUrl} alt={displayProduct.title} className="product-hero-image" />
                ) : (
                  <div className="product-hero-placeholder">
                    <Box size={48} opacity={0.3} />
                  </div>
                )}
                <div className="product-hero-content">
                  <div className="badge product-archetype">{displayProduct.archetype.replace(/_/g, ' ')}</div>
                  <h2 className="product-hero-title">{displayProduct.title}</h2>
                  {displayProduct.description && (
                    <p className="product-hero-desc">{displayProduct.description}</p>
                  )}
                  <div className="product-hero-price">
                    {displayProduct.currency === "USDC" 
                      ? `$${(Number(displayProduct.priceMinorUnits) / 1000000).toFixed(2)} USDC`
                      : `${(Number(displayProduct.priceMinorUnits) / 1000000000).toFixed(2)} SOL`}
                  </div>
                </div>
              </div>
            )}

            <div className="divider" />

            {/* Payment Mode Selector */}
            {mode === 'choose' && (
              <div className="payment-options">
                <h3 className="section-title">Select Payment Method</h3>
                <div className="grid-2">
                  <button type="button" className="premium-pay-card crypto-card" onClick={() => setMode('crypto')}>
                    <div className="pay-card-icon"><Wallet size={24} /></div>
                    <div className="pay-card-content">
                      <h4>Pay with Crypto</h4>
                      <p>Instant settlement via Solana</p>
                    </div>
                  </button>

                  <button type="button" className="premium-pay-card stripe-card" onClick={() => setMode('card')}>
                    <div className="pay-card-icon"><CreditCard size={24} /></div>
                    <div className="pay-card-content">
                      <h4>Pay with Card</h4>
                      <p>Visa, Mastercard, Apple Pay</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Crypto mode */}
            {mode === 'crypto' && (
              <div className="payment-active-section animate-rise">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h3 className="section-title" style={{ margin: 0 }}>Crypto Checkout</h3>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMode('choose')}>
                    Change Method
                  </button>
                </div>
                {mobile && <WalletSelectorGrid actionApiUrl={actionApiUrl} username={creator.username} />}
                <PremiumCheckout creator={creator} actionApiUrl={actionApiUrl} mobile={mobile} productId={productId} />
              </div>
            )}

            {/* Card mode */}
            {mode === 'card' && (
              <div className="payment-active-section animate-rise">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h3 className="section-title" style={{ margin: 0 }}>Card Checkout</h3>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMode('choose')}>
                    Change Method
                  </button>
                </div>
                
                {cardStatus && (
                  <p className={cardStatus.includes('unavailable') || cardStatus.includes('error') ? 'notice notice-err' : 'notice notice-ok'}>
                    {cardStatus}
                  </p>
                )}
                
                <div className="stack" style={{ gap: 12 }}>
                  {(productId ? creator.products.filter((p) => p.id === productId) : creator.products).map((product) => (
                    <div key={product.id} className="stripe-product-row">
                      <div className="stripe-product-info">
                        <strong>{product.title}</strong>
                        <span>{product.archetype.replace(/_/g, ' ')}</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={cardLoading}
                        onClick={() => handleCardPay(product.id)}
                      >
                        {cardLoading ? <Loader2 size={16} className="animate-spin" /> : "Checkout"}
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 24, opacity: 0.5 }}>
                   <span style={{ fontSize: 12, fontWeight: 500 }}>Powered by Stripe</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </SolanaWalletProvider>
  );
}
