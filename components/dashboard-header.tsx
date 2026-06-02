import Link from "next/link";
import { Zap } from "lucide-react";
import { BRAND_GRADIENT } from "@/lib/brand";

export function DashboardHeader() {
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
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Link href="/creator/demo" className="btn btn-secondary">
            Demo checkout
          </Link>
          <Link href="/" className="btn btn-ghost">
            Marketing site
          </Link>
        </div>
      </div>
    </header>
  );
}

