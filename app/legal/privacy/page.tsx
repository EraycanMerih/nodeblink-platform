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
            <p><strong>Last updated: June 2026</strong></p>
            <p>
              NodeBlink ("we", "our", or "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our API, or interact with our protocol.
            </p>

            <h2 style={{ color: 'var(--text)', fontSize: 20, marginTop: 16 }}>1. Information We Do Not Collect</h2>
            <p>
              As a non-custodial and decentralized protocol, we inherently minimize data collection. <strong>We do not collect, store, or process:</strong>
            </p>
            <ul style={{ marginLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>Private keys, seed phrases, or wallet passwords.</li>
              <li>Credit card numbers, bank details, or KYC documents (these are handled directly by Stripe).</li>
              <li>Custodial balances or user funds.</li>
            </ul>

            <h2 style={{ color: 'var(--text)', fontSize: 20, marginTop: 16 }}>2. Information We Collect</h2>
            <p>We may collect the following information to facilitate protocol operation:</p>
            <ul style={{ marginLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><strong>Public Blockchain Data:</strong> Wallet addresses, transaction signatures, and on-chain program interactions. This data is inherently public on the Solana blockchain.</li>
              <li><strong>Profile Data:</strong> Display names, avatars, bios, and connected social media accounts (e.g., Twitter/X) if you voluntarily link them to our Trust Registry.</li>
              <li><strong>Usage Data:</strong> Basic analytics such as IP addresses, browser types, and API request logs to prevent abuse and monitor network health.</li>
            </ul>

            <h2 style={{ color: 'var(--text)', fontSize: 20, marginTop: 16 }}>3. How We Use Your Information</h2>
            <p>
              We use the collected information exclusively to:
            </p>
            <ul style={{ marginLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>Provide, maintain, and improve the NodeBlink protocol.</li>
              <li>Facilitate the Trust Registry API and verified merchant checks.</li>
              <li>Detect, prevent, and address technical issues, fraud, or abuse.</li>
            </ul>

            <h2 style={{ color: 'var(--text)', fontSize: 20, marginTop: 16 }}>4. Third-Party Services</h2>
            <p>
              We integrate with third-party providers (e.g., Stripe Connect, Solana RPC providers, Supabase). Your interaction with these services is governed by their respective privacy policies. NodeBlink is not responsible for the privacy practices of any third parties.
            </p>

            <h2 style={{ color: 'var(--text)', fontSize: 20, marginTop: 16 }}>5. Data Retention & Deletion</h2>
            <p>
              You may request the deletion of your off-chain profile data by contacting us. However, please note that any data written to the Solana blockchain (such as transaction records) is immutable and cannot be altered or deleted by NodeBlink.
            </p>

            <h2 style={{ color: 'var(--text)', fontSize: 20, marginTop: 16 }}>6. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
