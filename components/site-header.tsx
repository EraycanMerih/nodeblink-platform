import Link from "next/link";
import { Zap } from "lucide-react";
import { BRAND_GRADIENT } from "@/lib/brand";

export function SiteHeader() {
  return (
    <header className="nav-blur">
      <div
        className="shell"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 0",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Link
          href="/"
          className="display"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 700,
            fontSize: 20,
          }}
        >
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              display: "grid",
              placeItems: "center",
              background: BRAND_GRADIENT,
              color: "#0a1628",
            }}
          >
            <Zap size={18} />
          </span>
          NodeBlink
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Link href="/#how-it-works" className="btn btn-ghost">
            How it works
          </Link>
          <Link href="/#features" className="btn btn-ghost">
            Features
          </Link>
          <Link href="/#pricing" className="btn btn-ghost">
            Fees
          </Link>
          <Link href="/dashboard" className="btn btn-secondary">
            Creator Studio
          </Link>
          <Link href="/creator/demo" className="btn btn-primary">
            Live demo
          </Link>
        </nav>
      </div>
    </header>
  );
}
