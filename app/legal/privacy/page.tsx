import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata = {
  title: 'Privacy Policy | NodeBlink',
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="shell animate-rise" style={{ padding: '120px 0', maxWidth: 800, margin: '0 auto' }}>
        <h1 className="display" style={{ marginBottom: 40 }}>Privacy Policy</h1>
        <div className="panel" style={{ padding: 40 }}>
          <div className="stack" style={{ gap: 24, color: 'var(--muted)', lineHeight: 1.6 }}>
            <p>Last updated: June 2026</p>
            
            <h2 style={{ color: 'var(--text)', fontSize: 20, marginTop: 16 }}>1. Information We Collect</h2>
            <p>
              NodeBlink only collects information strictly necessary to facilitate routing and account creation. This includes your public wallet address, chosen username, and optional profile metadata (display name, bio).
            </p>

            <h2 style={{ color: 'var(--text)', fontSize: 20, marginTop: 16 }}>2. Non-Custodial Nature</h2>
            <p>
              We do not collect or store your private keys, seed phrases, or credit card information. Credit card processing is handled securely by Stripe, and Solana transactions are signed locally by your wallet.
            </p>

            <h2 style={{ color: 'var(--text)', fontSize: 20, marginTop: 16 }}>3. Data Sharing</h2>
            <p>
              We do not sell your personal data. Data is only shared with our infrastructure providers (e.g., Stripe) strictly to the extent necessary to process payments.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
