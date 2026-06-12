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
            <p>Last updated: June 2026</p>
            
            <h2 style={{ color: 'var(--text)', fontSize: 20, marginTop: 16 }}>1. Non-Custodial Protocol</h2>
            <p>
              NodeBlink acts solely as a non-custodial routing protocol. We do not hold, custody, or manage any funds. All cryptocurrency transactions are peer-to-peer and settled directly on the Solana blockchain. All fiat transactions are routed directly to the creator's connected Stripe account.
            </p>

            <h2 style={{ color: 'var(--text)', fontSize: 20, marginTop: 16 }}>2. Creator Responsibilities</h2>
            <p>
              Creators are entirely responsible for the digital products, access passes, and content they distribute through NodeBlink. NodeBlink does not endorse, verify, or guarantee the quality or legality of any creator's offerings.
            </p>

            <h2 style={{ color: 'var(--text)', fontSize: 20, marginTop: 16 }}>3. Dispute Resolution</h2>
            <p>
              Because NodeBlink does not hold funds, we cannot issue refunds or reverse cryptocurrency transactions. Any disputes must be handled directly between the buyer and the creator.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
