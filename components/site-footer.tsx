import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/brand";
import { PUBLIC_BASE_URL } from "@/lib/env";

export function SiteFooter() {
  const domain = PUBLIC_BASE_URL.replace(/^https?:\/\//, "");

  return (
    <footer style={{ marginTop: 80, borderTop: "1px solid var(--color-line)", background: "white" }}>
      <div className="shell stack" style={{ padding: "40px 0" }}>
        <div className="grid-2">
          <div className="stack">
            <strong className="display" style={{ fontSize: 22 }}>
              NodeBlink
            </strong>
            <p className="muted" style={{ margin: 0, maxWidth: 420, lineHeight: 1.7 }}>
              Creator checkout on Solana with native Actions discovery at{" "}
              <strong>{domain}</strong>. Non-custodial payments, encrypted file delivery, and transparent protocol fees.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
            <Link href="/dashboard" className="muted">
              Creator Studio
            </Link>
            <Link href="/creator/demo" className="muted">
              Demo checkout
            </Link>
            <Link href="/actions.json" className="muted">
              actions.json
            </Link>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="muted">
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
        <p className="muted" style={{ margin: 0, fontSize: 13 }}>
          © {new Date().getFullYear()} NodeBlink · Solana mainnet · Protocol fee {process.env.PLATFORM_FEE_BPS ? `${Number(process.env.PLATFORM_FEE_BPS) / 100}%` : "2%"}
        </p>
      </div>
    </footer>
  );
}
