import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata = {
  title: 'Terms of Service | NodeBlink',
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="shell animate-rise" style={{ padding: '120px 0', maxWidth: 800, margin: '0 auto' }}>
        <h1 className="display" style={{ marginBottom: 40 }}>Terms of Service</h1>
        <div className="panel" style={{ padding: 40 }}>
          <div className="stack" style={{ gap: 24, color: 'var(--muted)', lineHeight: 1.6 }}>
            <p><strong>Last updated: June 2026</strong></p>
            <p>
              Welcome to NodeBlink. By accessing or using our protocol, services, APIs, and website ("Services"), you agree to be bound by these comprehensive Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Services.
            </p>
            
            <h2 style={{ color: 'var(--text)', fontSize: 20, marginTop: 16 }}>1. Description of Service & Non-Custodial Nature</h2>
            <p>
              NodeBlink acts <strong>strictly as a non-custodial, decentralized routing protocol</strong>. We provide software that enables creators ("Merchants") to accept peer-to-peer cryptocurrency transactions and fiat payments via third-party processors. 
              <strong>NodeBlink does not, at any time, hold, custody, manage, transmit, or control any user funds, digital assets, or fiat currency.</strong> All cryptocurrency transactions are executed directly on the Solana blockchain between the buyer and the Merchant. Fiat transactions are securely processed directly by Stripe Connect.
            </p>

            <h2 style={{ color: 'var(--text)', fontSize: 20, marginTop: 16 }}>2. Assumption of Risk & Zero Liability</h2>
            <p>
              You acknowledge that using cryptographic and blockchain-based systems involves inherent risks, including but not volatility, smart contract vulnerabilities, and regulatory uncertainty. 
              <strong>To the maximum extent permitted by applicable law, NodeBlink and its developers, affiliates, and operators shall not be held liable for any direct, indirect, incidental, consequential, or punitive damages, including loss of profits, loss of funds, or data loss arising from your use of the Services.</strong>
            </p>

            <h2 style={{ color: 'var(--text)', fontSize: 20, marginTop: 16 }}>3. Merchant Responsibilities & Compliance</h2>
            <p>
              As a Merchant using NodeBlink, you are entirely responsible for the digital products, content, services, or access passes you distribute. You warrant that:
            </p>
            <ul style={{ marginLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>You own or have the necessary licenses to distribute your products.</li>
              <li>Your products do not violate any applicable laws, regulations, or third-party rights.</li>
              <li>You will handle all customer support, fulfillment, and disputes directly with your buyers.</li>
              <li>You will comply with all tax obligations arising from your sales.</li>
            </ul>

            <h2 style={{ color: 'var(--text)', fontSize: 20, marginTop: 16 }}>4. Disputes, Refunds, & Chargebacks</h2>
            <p>
              Because NodeBlink never holds funds, <strong>we have no technical ability to issue refunds, reverse blockchain transactions, or mediate disputes</strong>. Any disputes, refunds, or chargebacks must be resolved exclusively between the buyer and the Merchant. NodeBlink acts solely as the software infrastructure facilitating the connection.
            </p>

            <h2 style={{ color: 'var(--text)', fontSize: 20, marginTop: 16 }}>5. Intellectual Property & DMCA</h2>
            <p>
              NodeBlink respects intellectual property rights. If you believe a Merchant is infringing on your copyrights, you may submit a DMCA takedown notice to our designated agent. While we cannot remove data from the blockchain, we reserve the right to delist, hide, or terminate the Merchant's frontend profile interface on our domains.
            </p>

            <h2 style={{ color: 'var(--text)', fontSize: 20, marginTop: 16 }}>6. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless NodeBlink, its operators, and affiliates from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from your violation of these Terms, your use of the Services, or your infringement of any third-party rights.
            </p>

            <h2 style={{ color: 'var(--text)', fontSize: 20, marginTop: 16 }}>7. Governing Law & Arbitration</h2>
            <p>
              These Terms shall be governed by and construed in accordance with international commercial law. Any dispute arising from or relating to these Terms or the Services shall be finally settled by binding arbitration, waiving any right to participate in a class action lawsuit or class-wide arbitration.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
